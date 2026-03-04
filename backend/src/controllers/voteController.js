const { Vote, Tour } = require('../models');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');

/**
 * Lấy danh sách đánh giá đã duyệt của tour
 * GET /api/tours/:id/votes
 */
const getApprovedVotes = catchAsync(async (req, res) => {
    const { id } = req.params;

    const votes = await Vote.findAll({
        where: { tour_id: id, is_approved: 1 },
        attributes: ['id', 'customer_name', 'rating', 'comment', 'created_at'],
        order: [['created_at', 'DESC']],
    });

    res.status(200).json({
        status: 'success',
        results: votes.length,
        data: votes,
    });
});

/**
 * Gửi đánh giá cho tour (mặc định chưa duyệt)
 * POST /api/tours/:id/votes
 */
const createVote = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { customer_name, customer_email, rating, comment } = req.body;

    // Kiểm tra tour tồn tại
    const tour = await Tour.findByPk(id);
    if (!tour) {
        return next(new AppError('Tour không tồn tại', HTTP_CODES.NOT_FOUND));
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
        return next(new AppError('Đánh giá phải từ 1 đến 5 sao', HTTP_CODES.BAD_REQUEST));
    }

    const vote = await Vote.create({
        tour_id: id,
        customer_name,
        customer_email,
        rating,
        comment: comment || null,
        is_approved: 0, // Mặc định chưa duyệt
    });

    res.status(201).json({
        status: 'success',
        message: 'Đánh giá của bạn đã được gửi và đang chờ duyệt',
        data: {
            id: vote.id,
            rating: vote.rating,
            is_approved: false,
        },
    });
});

module.exports = { getApprovedVotes, createVote };
