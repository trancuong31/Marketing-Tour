const { Vote, Tour, Notification, VoteLike } = require('../models');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');

/**
 * Lấy danh sách đánh giá đã duyệt của tour
 * GET /api/tours/:id/votes
 */
const getApprovedVotes = catchAsync(async (req, res) => {
    const { id } = req.params;
    const tourId = parseInt(id, 10);
    const userId = req.user?.id || null;

    const votes = await Vote.findAll({
        where: { tour_id: tourId, is_approved: 1, parent_id: null },
        attributes: ['id', 'user_id', 'customer_name', 'rating', 'comment', 'images', 'likes_count', 'admin_reply', 'admin_reply_at', 'created_at'],
        include: [
            {
                model: Vote,
                as: 'replies',
                where: { is_approved: 1 },
                required: false,
                attributes: ['id', 'user_id', 'customer_name', 'comment', 'images', 'likes_count', 'created_at'],
                include: userId ? [{
                    model: VoteLike,
                    as: 'userLikes',
                    where: { user_id: userId },
                    required: false,
                    attributes: ['id']
                }] : [],
            },
            userId ? {
                model: VoteLike,
                as: 'userLikes',
                where: { user_id: userId },
                required: false,
                attributes: ['id']
            } : null
        ].filter(Boolean),
        order: [['created_at', 'DESC']],
    });

    // Map kết quả để chèn user_has_liked
    const data = votes.map(v => {
        const json = v.get({ plain: true });
        json.user_has_liked = json.userLikes && json.userLikes.length > 0;
        delete json.userLikes;
        
        if (json.replies) {
            json.replies = json.replies.map(r => {
                r.user_has_liked = r.userLikes && r.userLikes.length > 0;
                delete r.userLikes;
                return r;
            });
        }
        return json;
    });

    res.status(200).json({
        status: 'success',
        results: data.length,
        data,
    });
});

/**
 * Gửi đánh giá hoặc phản hồi cho tour
 * POST /api/tours/:id/votes
 */
const createVote = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { rating, comment, parent_id } = req.body;
    
    const customer_name = req.user?.full_name || 'Khách hàng';
    const customer_email = req.user?.email || '';

    // Kiểm tra tour tồn tại
    const tour = await Tour.findByPk(id);
    if (!tour) {
        return next(new AppError('Tour không tồn tại', HTTP_CODES.NOT_FOUND));
    }

    // Nếu không phải là phản hồi (parent_id là null), yêu cầu rating
    if (!parent_id && (!rating || rating < 1 || rating > 5)) {
        return next(new AppError('Đánh giá phải từ 1 đến 5 sao', HTTP_CODES.BAD_REQUEST));
    }

    if (!comment && (!req.files || req.files.length === 0)) {
        return next(new AppError('Vui lòng nhập nội dung hoặc đính kèm hình ảnh', HTTP_CODES.BAD_REQUEST));
    }

    let images = [];
    if (req.files && req.files.length > 0) {
        images = req.files.map(file => `/uploads/votes/${file.filename}`);
    }

    const vote = await Vote.create({
        tour_id: id,
        user_id: req.user?.id || null, // Lưu ID người đánh giá
        customer_name,
        customer_email,
        rating: parent_id ? 0 : rating, 
        comment: comment || null,
        images: images.length > 0 ? images : null,
        parent_id: parent_id || null,
        is_approved: 1,
    });

    // Tạo thông báo cho người sở hữu bình luận gốc
    if (parent_id) {
        const parentVote = await Vote.findByPk(parent_id);
        if (parentVote && parentVote.user_id && parentVote.user_id !== req.user?.id) {
            await Notification.create({
                user_id: parentVote.user_id,
                type: 'reply',
                sender_name: customer_name,
                message: `đã phản hồi bình luận của bạn tại tour "${tour.title}"`,
                related_id: id,
                related_slug: tour.slug
            });
        }
    }

    res.status(201).json({
        status: 'success',
        message: parent_id ? 'Đã gửi phản hồi của bạn!' : 'Cảm ơn bạn đã để lại đánh giá!',
        data: {
            id: vote.id,
            rating: vote.rating,
            is_approved: true,
        },
    });
});

/**
 * Lấy danh sách đánh giá 5 sao tiêu biểu (toàn hệ thống)
 * GET /api/tours/featured-reviews
 */
const getFeaturedVotes = catchAsync(async (req, res) => {
    const votes = await Vote.findAll({
        where: { rating: 5, is_approved: 1 },
        include: [{
            model: Tour,
            attributes: ['id', 'title'],
        }],
        limit: 15,
        order: [['created_at', 'DESC']],
    });

    res.status(200).json({
        status: 'success',
        results: votes.length,
        data: votes,
    });
});

/**
 * Xóa một đánh giá hoặc phản hồi
 * DELETE /api/tours/votes/:id
 */
const deleteVote = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    const vote = await Vote.findByPk(id);

    if (!vote) {
        return next(new AppError('Không tìm thấy đánh giá', HTTP_CODES.NOT_FOUND));
    }

    // Kiểm tra quyền sở hữu
    if (vote.user_id !== userId) {
        return next(new AppError('Bạn không có quyền xóa bình luận này', HTTP_CODES.FORBIDDEN));
    }

    // Xóa bình luận (Sequelize sẽ tự động xóa replies nhờ association onDelete: CASCADE)
    await vote.destroy();

    res.status(200).json({
        status: 'success',
        message: 'Đã xóa bình luận thành công',
    });
});

/**
 * Thích một đánh giá
 * POST /api/tours/votes/:id/like
 */
const likeVote = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    const vote = await Vote.findByPk(id);
    if (!vote) {
        return next(new AppError('Không tìm thấy đánh giá', HTTP_CODES.NOT_FOUND));
    }

    // Kiểm tra xem user đã like chưa
    const existingLike = await VoteLike.findOne({
        where: { vote_id: id, user_id: userId }
    });

    let isLiked = false;

    if (existingLike) {
        // Nếu đã like -> UNLIKE
        await existingLike.destroy();
        await vote.decrement('likes_count');
        isLiked = false;
    } else {
        // Nếu chưa like -> LIKE
        await VoteLike.create({ vote_id: id, user_id: userId });
        await vote.increment('likes_count');
        isLiked = true;

        // Chỉ tạo thông báo cho người sở hữu bình luận nếu họ có user_id và không phải tự like
        if (vote.user_id && vote.user_id !== userId) {
            const tour = await Tour.findByPk(vote.tour_id);
            await Notification.create({
                user_id: vote.user_id,
                type: 'like',
                sender_name: req.user.full_name || 'Người dùng',
                message: `đã thích bình luận của bạn tại tour "${tour?.title || ''}"`,
                related_id: vote.id,
                related_slug: tour?.slug
            });
        }
    }

    res.status(200).json({
        status: 'success',
        data: {
            id: vote.id,
            likes_count: isLiked ? vote.likes_count + 1 : vote.likes_count - 1,
            isLiked
        },
    });
});

module.exports = { getApprovedVotes, createVote, getFeaturedVotes, likeVote, deleteVote };
