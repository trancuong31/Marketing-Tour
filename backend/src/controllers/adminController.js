// const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const slugify = require('slugify');
const { User, Role, Tour, TourImage, Booking, Vote, Guide, Category } = require('../models');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');
const env = require('../config/env');

// ══════════════════════════════════════
// AUTH
// ══════════════════════════════════════

/**
 * Đăng nhập Admin
 * POST /api/admin/login
 */
const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Vui lòng nhập email và mật khẩu', HTTP_CODES.BAD_REQUEST));
    }

    const user = await User.findOne({
        where: { email, is_active: 1 },
        include: [{ model: Role, attributes: ['role_name'] }],
    });

    if (!user) {
        return next(new AppError('Email hoặc mật khẩu không đúng', HTTP_CODES.UNAUTHORIZED));
    }

    // const isPasswordValid = await bcrypt.compare(password, user.password);
    const isPasswordValid = password === user.password;
    if (!isPasswordValid) {
        return next(new AppError('Email hoặc mật khẩu không đúng', HTTP_CODES.UNAUTHORIZED));
    }

    // Cập nhật last_login
    await user.update({ last_login: new Date() });

    const token = jwt.sign({ id: user.id, role: user.Role?.role_name }, env.jwt.secret, {
        expiresIn: env.jwt.expiresIn,
    });

    res.status(200).json({
        status: 'success',
        data: {
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.Role?.role_name,
                avatar_url: user.avatar_url,
            },
        },
    });
});

// ══════════════════════════════════════
// TOUR CRUD
// ══════════════════════════════════════

/**
 * Lấy tất cả tours (admin)
 * GET /api/admin/tours
 */
const getAllTours = catchAsync(async (req, res) => {
    const tours = await Tour.findAll({
        include: [
            { model: Category, attributes: ['id', 'name'] },
            { model: TourImage, as: 'images', attributes: ['id', 'image_url', 'sort_order'] },
        ],
        order: [['id', 'DESC']],
    });

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: tours,
    });
});

/**
 * Tạo tour mới
 * POST /api/admin/tours
 */
const createTour = catchAsync(async (req, res, next) => {
    const {
        category_id, title, summary, content,
        price_adult, sale_price_adult,
        price_child, sale_price_child,
        price_infant, sale_price_infant,
        departure_point, duration_days, duration_nights,
        is_featured, status,
    } = req.body;

    if (!title || !category_id || !price_adult) {
        return next(new AppError('Tiêu đề, danh mục và giá người lớn là bắt buộc', HTTP_CODES.BAD_REQUEST));
    }

    const slug = slugify(title, { lower: true, strict: true, locale: 'vi' });

    // Kiểm tra slug trùng
    const existingSlug = await Tour.findOne({ where: { slug } });
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    const tour = await Tour.create({
        category_id,
        title,
        slug: finalSlug,
        summary: summary || null,
        content: content || null,
        price_adult,
        sale_price_adult: sale_price_adult || null,
        price_child: price_child || null,
        sale_price_child: sale_price_child || null,
        price_infant: price_infant || null,
        sale_price_infant: sale_price_infant || null,
        departure_point: departure_point || null,
        duration_days: duration_days || null,
        duration_nights: duration_nights || null,
        thumbnail_url: null,
        is_featured: is_featured || 0,
        status: status || 'active',
    });

    // Xử lý ảnh upload nếu có
    if (req.files && req.files.length > 0) {
        const imageRecords = req.files.map((file, index) => ({
            tour_id: tour.id,
            image_url: `/uploads/tours/${file.filename}`,
            sort_order: index,
        }));
        await TourImage.bulkCreate(imageRecords);

        // Set thumbnail là ảnh đầu tiên
        await tour.update({ thumbnail_url: imageRecords[0].image_url });
    }

    const createdTour = await Tour.findByPk(tour.id, {
        include: [
            { model: Category, attributes: ['id', 'name'] },
            { model: TourImage, as: 'images' },
        ],
    });

    res.status(201).json({
        status: 'success',
        message: 'Tạo tour thành công',
        data: createdTour,
    });
});

/**
 * Cập nhật tour
 * PUT /api/admin/tours/:id
 */
const updateTour = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const tour = await Tour.findByPk(id);

    if (!tour) {
        return next(new AppError('Không tìm thấy tour', HTTP_CODES.NOT_FOUND));
    }

    const {
        category_id, title, summary, content,
        price_adult, sale_price_adult,
        price_child, sale_price_child,
        price_infant, sale_price_infant,
        departure_point, duration_days, duration_nights,
        is_featured, status,
    } = req.body;

    // Nếu đổi title → tạo slug mới
    let newSlug = tour.slug;
    if (title && title !== tour.title) {
        newSlug = slugify(title, { lower: true, strict: true, locale: 'vi' });
        const existingSlug = await Tour.findOne({ where: { slug: newSlug, id: { [Op.ne]: id } } });
        if (existingSlug) newSlug = `${newSlug}-${Date.now()}`;
    }

    await tour.update({
        category_id: category_id || tour.category_id,
        title: title || tour.title,
        slug: newSlug,
        summary: summary !== undefined ? summary : tour.summary,
        content: content !== undefined ? content : tour.content,
        price_adult: price_adult || tour.price_adult,
        sale_price_adult: sale_price_adult !== undefined ? sale_price_adult : tour.sale_price_adult,
        price_child: price_child !== undefined ? price_child : tour.price_child,
        sale_price_child: sale_price_child !== undefined ? sale_price_child : tour.sale_price_child,
        price_infant: price_infant !== undefined ? price_infant : tour.price_infant,
        sale_price_infant: sale_price_infant !== undefined ? sale_price_infant : tour.sale_price_infant,
        departure_point: departure_point !== undefined ? departure_point : tour.departure_point,
        duration_days: duration_days !== undefined ? duration_days : tour.duration_days,
        duration_nights: duration_nights !== undefined ? duration_nights : tour.duration_nights,
        is_featured: is_featured !== undefined ? is_featured : tour.is_featured,
        status: status || tour.status,
    });

    // Xử lý ảnh mới nếu upload
    if (req.files && req.files.length > 0) {
        const currentImages = await TourImage.findAll({ where: { tour_id: id } });
        const nextOrder = currentImages.length;

        const imageRecords = req.files.map((file, index) => ({
            tour_id: tour.id,
            image_url: `/uploads/tours/${file.filename}`,
            sort_order: nextOrder + index,
        }));
        await TourImage.bulkCreate(imageRecords);

        // Cập nhật thumbnail nếu chưa có
        if (!tour.thumbnail_url) {
            await tour.update({ thumbnail_url: imageRecords[0].image_url });
        }
    }

    const updatedTour = await Tour.findByPk(id, {
        include: [
            { model: Category, attributes: ['id', 'name'] },
            { model: TourImage, as: 'images' },
        ],
    });

    res.status(200).json({
        status: 'success',
        message: 'Cập nhật tour thành công',
        data: updatedTour,
    });
});

/**
 * Xóa tour
 * DELETE /api/admin/tours/:id
 */
const deleteTour = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const tour = await Tour.findByPk(id);

    if (!tour) {
        return next(new AppError('Không tìm thấy tour', HTTP_CODES.NOT_FOUND));
    }

    // Xóa ảnh liên quan (CASCADE sẽ tự xóa trong DB)
    await tour.destroy();

    res.status(200).json({
        status: 'success',
        message: 'Xóa tour thành công',
    });
});

// ══════════════════════════════════════
// BOOKING MANAGEMENT
// ══════════════════════════════════════

/**
 * Lấy danh sách đơn đặt tour (admin)
 * GET /api/admin/bookings?status=pending|contacted|approved|cancelled
 */
const getBookings = catchAsync(async (req, res) => {
    const { status } = req.query;
    const whereClause = {};
    if (status) whereClause.status = status;

    const bookings = await Booking.findAll({
        where: whereClause,
        include: [
            { model: Tour, attributes: ['id', 'title', 'slug', 'price_adult', 'sale_price_adult'] },
        ],
        order: [['created_at', 'DESC']],
    });

    res.status(200).json({
        status: 'success',
        results: bookings.length,
        data: bookings,
    });
});

/**
 * Cập nhật trạng thái đơn đặt
 * PUT /api/admin/bookings/:id/status
 */
const updateBookingStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status, admin_note } = req.body;

    const validStatuses = ['pending', 'contacted', 'approved', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return next(new AppError('Trạng thái không hợp lệ', HTTP_CODES.BAD_REQUEST));
    }

    const booking = await Booking.findByPk(id);
    if (!booking) {
        return next(new AppError('Không tìm thấy đơn đặt', HTTP_CODES.NOT_FOUND));
    }

    await booking.update({
        status,
        admin_note: admin_note !== undefined ? admin_note : booking.admin_note,
    });

    res.status(200).json({
        status: 'success',
        message: 'Cập nhật trạng thái thành công',
        data: booking,
    });
});

// ══════════════════════════════════════
// VOTE MANAGEMENT
// ══════════════════════════════════════

/**
 * Lấy tất cả votes (admin)
 * GET /api/admin/votes?approved=0|1
 */
const getVotes = catchAsync(async (req, res) => {
    const { approved } = req.query;
    const whereClause = {};
    if (approved !== undefined) whereClause.is_approved = parseInt(approved);

    const votes = await Vote.findAll({
        where: whereClause,
        include: [
            { model: Tour, attributes: ['id', 'title'] },
        ],
        order: [['created_at', 'DESC']],
    });

    res.status(200).json({
        status: 'success',
        results: votes.length,
        data: votes,
    });
});

/**
 * Duyệt/Từ chối đánh giá
 * PUT /api/admin/votes/:id
 */
const updateVoteStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { is_approved } = req.body;

    const vote = await Vote.findByPk(id);
    if (!vote) {
        return next(new AppError('Không tìm thấy đánh giá', HTTP_CODES.NOT_FOUND));
    }

    await vote.update({ is_approved: is_approved ? 1 : 0 });

    res.status(200).json({
        status: 'success',
        message: is_approved ? 'Đã duyệt đánh giá' : 'Đã từ chối đánh giá',
        data: vote,
    });
});

// ══════════════════════════════════════
// GUIDE MANAGEMENT
// ══════════════════════════════════════

/**
 * Lấy tất cả guides (admin, bao gồm cả inactive)
 * GET /api/admin/guides
 */
const getAllGuides = catchAsync(async (req, res) => {
    const guides = await Guide.findAll({
        order: [['updated_at', 'DESC']],
    });

    res.status(200).json({
        status: 'success',
        results: guides.length,
        data: guides,
    });
});

/**
 * Tạo bài hướng dẫn mới
 * POST /api/admin/guides
 */
const createGuide = catchAsync(async (req, res) => {
    const { title, content, is_active } = req.body;

    const slug = slugify(title, { lower: true, strict: true, locale: 'vi' });
    const existingSlug = await Guide.findOne({ where: { slug } });
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    const guide = await Guide.create({
        title,
        slug: finalSlug,
        content,
        is_active: is_active !== undefined ? is_active : 1,
    });

    res.status(201).json({
        status: 'success',
        message: 'Tạo bài hướng dẫn thành công',
        data: guide,
    });
});

/**
 * Cập nhật bài hướng dẫn
 * PUT /api/admin/guides/:id
 */
const updateGuide = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const guide = await Guide.findByPk(id);

    if (!guide) {
        return next(new AppError('Không tìm thấy bài hướng dẫn', HTTP_CODES.NOT_FOUND));
    }

    const { title, content, is_active } = req.body;

    let newSlug = guide.slug;
    if (title && title !== guide.title) {
        newSlug = slugify(title, { lower: true, strict: true, locale: 'vi' });
        const existingSlug = await Guide.findOne({ where: { slug: newSlug, id: { [Op.ne]: id } } });
        if (existingSlug) newSlug = `${newSlug}-${Date.now()}`;
    }

    await guide.update({
        title: title || guide.title,
        slug: newSlug,
        content: content !== undefined ? content : guide.content,
        is_active: is_active !== undefined ? is_active : guide.is_active,
    });

    res.status(200).json({
        status: 'success',
        message: 'Cập nhật bài hướng dẫn thành công',
        data: guide,
    });
});

/**
 * Xóa ảnh tour
 * DELETE /api/admin/tour-images/:id
 */
const deleteTourImage = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const image = await TourImage.findByPk(id);

    if (!image) {
        return next(new AppError('Không tìm thấy ảnh', HTTP_CODES.NOT_FOUND));
    }

    await image.destroy();

    res.status(200).json({
        status: 'success',
        message: 'Xóa ảnh thành công',
    });
});

module.exports = {
    login,
    getAllTours,
    createTour,
    updateTour,
    deleteTour,
    getBookings,
    updateBookingStatus,
    getVotes,
    updateVoteStatus,
    getAllGuides,
    createGuide,
    updateGuide,
    deleteTourImage,
};
