const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const slugify = require('slugify');
const { sequelize } = require('../config/database');
const {
    User, Role, Tour, TourImage, TourItinerary, TourDeparture,
    TourPickupLocation, TourOption, Booking, BookingOption, Vote, Guide, Category, Banner,
} = require('../models');
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

    const isPasswordValid = password === user.password;
    if (!isPasswordValid) {
        return next(new AppError('Email hoặc mật khẩu không đúng', HTTP_CODES.UNAUTHORIZED));
    }

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
// HELPERS — Parse satellite data từ FormData
// ══════════════════════════════════════

const parseJsonField = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
        return JSON.parse(value);
    } catch {
        return [];
    }
};

// ══════════════════════════════════════
// TOUR CRUD
// ══════════════════════════════════════

/**
 * Lấy tất cả tours (admin) - kèm departures để hiện giá
 * GET /api/admin/tours
 */
const getAllTours = catchAsync(async (req, res) => {
    const tours = await Tour.findAll({
        include: [
            { model: Category, attributes: ['id', 'name'] },
            { model: TourImage, as: 'images', attributes: ['id', 'image_url', 'sort_order'] },
            { model: TourDeparture, as: 'departures', attributes: ['id', 'departure_date', 'price_adult', 'available_seats', 'status'] },
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
 * Lấy chi tiết 1 tour (admin) - kèm tất cả satellite data
 * GET /api/admin/tours/:id
 */
const getTourById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const tour = await Tour.findByPk(id, {
        include: [
            { model: Category, attributes: ['id', 'name'] },
            { model: TourImage, as: 'images', attributes: ['id', 'image_url', 'sort_order'], order: [['sort_order', 'ASC']] },
            { model: TourItinerary, as: 'itineraries', order: [['day_number', 'ASC']] },
            { model: TourDeparture, as: 'departures', order: [['departure_date', 'ASC']] },
            { model: TourPickupLocation, as: 'pickupLocations' },
            { model: TourOption, as: 'options' },
        ],
    });

    if (!tour) {
        return next(new AppError('Không tìm thấy tour', HTTP_CODES.NOT_FOUND));
    }

    res.status(200).json({
        status: 'success',
        data: tour,
    });
});

/**
 * Tạo tour mới (kèm satellite data)
 * POST /api/admin/tours
 */
const createTour = catchAsync(async (req, res, next) => {
    const {
        category_id, title, summary,
        highlights, price_includes, price_excludes,
        terms_and_notes, cancellation_policy,
        duration_days, duration_nights,
        tour_badge, status,
        itineraries, departures, pickup_locations, options,
    } = req.body;

    if (!title || !category_id) {
        return next(new AppError('Tiêu đề và danh mục là bắt buộc', HTTP_CODES.BAD_REQUEST));
    }

    const slug = slugify(title, { lower: true, strict: true, locale: 'vi' });
    const existingSlug = await Tour.findOne({ where: { slug } });
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    const result = await sequelize.transaction(async (t) => {
        // 1. Tạo tour chính
        const tour = await Tour.create({
            category_id,
            title,
            slug: finalSlug,
            summary: summary || null,
            highlights: highlights || null,
            price_includes: price_includes || null,
            price_excludes: price_excludes || null,
            terms_and_notes: terms_and_notes || null,
            cancellation_policy: cancellation_policy || null,
            duration_days: duration_days || null,
            duration_nights: duration_nights || null,
            thumbnail_url: null,
            tour_badge: tour_badge || 'none',
            status: status || 'active',
        }, { transaction: t });

        // 2. Ảnh upload
        if (req.files && req.files.length > 0) {
            const imageRecords = req.files.map((file, index) => ({
                tour_id: tour.id,
                image_url: `/uploads/tours/${file.filename}`,
                sort_order: index,
            }));
            await TourImage.bulkCreate(imageRecords, { transaction: t });
            await tour.update({ thumbnail_url: imageRecords[0].image_url }, { transaction: t });
        }

        // 3. Lịch trình
        const parsedItineraries = parseJsonField(itineraries);
        if (parsedItineraries.length > 0) {
            await TourItinerary.bulkCreate(
                parsedItineraries.map((item) => ({
                    tour_id: tour.id,
                    day_number: item.day_number,
                    title: item.title,
                    content: item.content,
                })),
                { transaction: t },
            );
        }

        // 4. Lịch khởi hành
        const parsedDepartures = parseJsonField(departures);
        if (parsedDepartures.length > 0) {
            await TourDeparture.bulkCreate(
                parsedDepartures.map((item) => ({
                    tour_id: tour.id,
                    departure_date: item.departure_date,
                    price_adult: item.price_adult,
                    price_child: item.price_child || 0,
                    price_infant: item.price_infant || 0,
                    available_seats: item.available_seats || 0,
                    status: item.status || 'open',
                })),
                { transaction: t },
            );
        }

        // 5. Điểm đón
        const parsedPickups = parseJsonField(pickup_locations);
        if (parsedPickups.length > 0) {
            await TourPickupLocation.bulkCreate(
                parsedPickups.map((item) => ({
                    tour_id: tour.id,
                    location_name: item.location_name,
                    pickup_time: item.pickup_time || null,
                    surcharge_amount: item.surcharge_amount || 0,
                })),
                { transaction: t },
            );
        }

        // 6. Tùy chọn
        const parsedOptions = parseJsonField(options);
        if (parsedOptions.length > 0) {
            await TourOption.bulkCreate(
                parsedOptions.map((item) => ({
                    tour_id: tour.id,
                    option_name: item.option_name,
                    price: item.price || 0,
                    charge_type: item.charge_type || 'quantity',
                })),
                { transaction: t },
            );
        }

        return tour;
    });

    // Reload tour đầy đủ
    const createdTour = await Tour.findByPk(result.id, {
        include: [
            { model: Category, attributes: ['id', 'name'] },
            { model: TourImage, as: 'images' },
            { model: TourItinerary, as: 'itineraries' },
            { model: TourDeparture, as: 'departures' },
            { model: TourPickupLocation, as: 'pickupLocations' },
            { model: TourOption, as: 'options' },
        ],
    });

    res.status(201).json({
        status: 'success',
        message: 'Tạo tour thành công',
        data: createdTour,
    });
});

/**
 * Cập nhật tour (replace-all cho satellite data)
 * PUT /api/admin/tours/:id
 */
const updateTour = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const tour = await Tour.findByPk(id);

    if (!tour) {
        return next(new AppError('Không tìm thấy tour', HTTP_CODES.NOT_FOUND));
    }

    const {
        category_id, title, summary,
        highlights, price_includes, price_excludes,
        terms_and_notes, cancellation_policy,
        duration_days, duration_nights,
        tour_badge, status,
        itineraries, departures, pickup_locations, options,
    } = req.body;

    // Nếu đổi title → tạo slug mới
    let newSlug = tour.slug;
    if (title && title !== tour.title) {
        newSlug = slugify(title, { lower: true, strict: true, locale: 'vi' });
        const existingSlug = await Tour.findOne({ where: { slug: newSlug, id: { [Op.ne]: id } } });
        if (existingSlug) newSlug = `${newSlug}-${Date.now()}`;
    }

    await sequelize.transaction(async (t) => {
        // 1. Update tour chính
        await tour.update({
            category_id: category_id || tour.category_id,
            title: title || tour.title,
            slug: newSlug,
            summary: summary !== undefined ? summary : tour.summary,
            highlights: highlights !== undefined ? highlights : tour.highlights,
            price_includes: price_includes !== undefined ? price_includes : tour.price_includes,
            price_excludes: price_excludes !== undefined ? price_excludes : tour.price_excludes,
            terms_and_notes: terms_and_notes !== undefined ? terms_and_notes : tour.terms_and_notes,
            cancellation_policy: cancellation_policy !== undefined ? cancellation_policy : tour.cancellation_policy,
            duration_days: duration_days !== undefined ? duration_days : tour.duration_days,
            duration_nights: duration_nights !== undefined ? duration_nights : tour.duration_nights,
            tour_badge: tour_badge !== undefined ? tour_badge : tour.tour_badge,
            status: status || tour.status,
        }, { transaction: t });

        // 2. Ảnh upload mới
        if (req.files && req.files.length > 0) {
            const currentImages = await TourImage.findAll({ where: { tour_id: id } });
            const nextOrder = currentImages.length;

            const imageRecords = req.files.map((file, index) => ({
                tour_id: tour.id,
                image_url: `/uploads/tours/${file.filename}`,
                sort_order: nextOrder + index,
            }));
            await TourImage.bulkCreate(imageRecords, { transaction: t });

            if (!tour.thumbnail_url) {
                await tour.update({ thumbnail_url: imageRecords[0].image_url }, { transaction: t });
            }
        }

        // 3. Replace-all satellite data (chỉ khi client gửi dữ liệu)
        if (itineraries !== undefined) {
            await TourItinerary.destroy({ where: { tour_id: id }, transaction: t });
            const parsedItineraries = parseJsonField(itineraries);
            if (parsedItineraries.length > 0) {
                await TourItinerary.bulkCreate(
                    parsedItineraries.map((item) => ({
                        tour_id: id,
                        day_number: item.day_number,
                        title: item.title,
                        content: item.content,
                    })),
                    { transaction: t },
                );
            }
        }

        if (departures !== undefined) {
            await TourDeparture.destroy({ where: { tour_id: id }, transaction: t });
            const parsedDepartures = parseJsonField(departures);
            if (parsedDepartures.length > 0) {
                await TourDeparture.bulkCreate(
                    parsedDepartures.map((item) => ({
                        tour_id: id,
                        departure_date: item.departure_date,
                        price_adult: item.price_adult,
                        price_child: item.price_child || 0,
                        price_infant: item.price_infant || 0,
                        available_seats: item.available_seats || 0,
                        status: item.status || 'open',
                    })),
                    { transaction: t },
                );
            }
        }

        if (pickup_locations !== undefined) {
            await TourPickupLocation.destroy({ where: { tour_id: id }, transaction: t });
            const parsedPickups = parseJsonField(pickup_locations);
            if (parsedPickups.length > 0) {
                await TourPickupLocation.bulkCreate(
                    parsedPickups.map((item) => ({
                        tour_id: id,
                        location_name: item.location_name,
                        pickup_time: item.pickup_time || null,
                        surcharge_amount: item.surcharge_amount || 0,
                    })),
                    { transaction: t },
                );
            }
        }

        if (options !== undefined) {
            await TourOption.destroy({ where: { tour_id: id }, transaction: t });
            const parsedOptions = parseJsonField(options);
            if (parsedOptions.length > 0) {
                await TourOption.bulkCreate(
                    parsedOptions.map((item) => ({
                        tour_id: id,
                        option_name: item.option_name,
                        price: item.price || 0,
                        charge_type: item.charge_type || 'quantity',
                    })),
                    { transaction: t },
                );
            }
        }
    });

    const updatedTour = await Tour.findByPk(id, {
        include: [
            { model: Category, attributes: ['id', 'name'] },
            { model: TourImage, as: 'images' },
            { model: TourItinerary, as: 'itineraries' },
            { model: TourDeparture, as: 'departures' },
            { model: TourPickupLocation, as: 'pickupLocations' },
            { model: TourOption, as: 'options' },
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
            { model: Tour, attributes: ['id', 'title', 'slug'] },
            { model: TourDeparture, as: 'departure', attributes: ['id', 'departure_date', 'price_adult'] },
            { model: TourPickupLocation, as: 'pickupLocation', attributes: ['id', 'location_name', 'surcharge_amount'] },
            { model: BookingOption, as: 'bookingOptions' },
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

const getVotes = catchAsync(async (req, res) => {
    const { approved } = req.query;
    const whereClause = {};
    if (approved !== undefined) whereClause.is_approved = parseInt(approved);

    const votes = await Vote.findAll({
        where: whereClause,
        include: [{ model: Tour, attributes: ['id', 'title'] }],
        order: [['created_at', 'DESC']],
    });

    res.status(200).json({
        status: 'success',
        results: votes.length,
        data: votes,
    });
});

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

const getAllGuides = catchAsync(async (req, res) => {
    const guides = await Guide.findAll({ order: [['updated_at', 'DESC']] });

    res.status(200).json({
        status: 'success',
        results: guides.length,
        data: guides,
    });
});

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

// ══════════════════════════════════════
// BANNER MANAGEMENT
// ══════════════════════════════════════

const getAllBanners = catchAsync(async (req, res) => {
    const banners = await Banner.findAll({
        order: [['position', 'ASC'], ['id', 'DESC']],
    });

    res.status(200).json({
        status: 'success',
        results: banners.length,
        data: banners,
    });
});

const createBanner = catchAsync(async (req, res, next) => {
    const { title, target_link, position, is_active, tour_id } = req.body;

    if (!title || !position) {
        return next(new AppError('Tiêu đề và vị trí là bắt buộc', HTTP_CODES.BAD_REQUEST));
    }

    const validPositions = ['hero', 'left_home', 'right_home'];
    if (!validPositions.includes(position)) {
        return next(new AppError('Vị trí không hợp lệ (hero, left_home, right_home)', HTTP_CODES.BAD_REQUEST));
    }

    if (!req.file) {
        return next(new AppError('Vui lòng upload ảnh banner', HTTP_CODES.BAD_REQUEST));
    }

    const banner = await Banner.create({
        title,
        image_url: `/uploads/banners/${req.file.filename}`,
        target_link: target_link || null,
        position,
        tour_id: tour_id || null,
        is_active: is_active !== undefined ? parseInt(is_active) : 1,
    });

    res.status(201).json({
        status: 'success',
        message: 'Tạo banner thành công',
        data: banner,
    });
});

const updateBanner = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const banner = await Banner.findByPk(id);

    if (!banner) {
        return next(new AppError('Không tìm thấy banner', HTTP_CODES.NOT_FOUND));
    }

    const { title, target_link, position, is_active } = req.body;

    if (position) {
        const validPositions = ['hero', 'left_home', 'right_home'];
        if (!validPositions.includes(position)) {
            return next(new AppError('Vị trí không hợp lệ (hero, left_home, right_home)', HTTP_CODES.BAD_REQUEST));
        }
    }

    const updateData = {
        title: title || banner.title,
        target_link: target_link !== undefined ? target_link : banner.target_link,
        position: position || banner.position,
        is_active: is_active !== undefined ? parseInt(is_active) : banner.is_active,
        updated_at: new Date(),
    };

    if (req.file) {
        updateData.image_url = `/uploads/banners/${req.file.filename}`;
    }

    await banner.update(updateData);

    res.status(200).json({
        status: 'success',
        message: 'Cập nhật banner thành công',
        data: banner,
    });
});

const deleteBanner = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const banner = await Banner.findByPk(id);

    if (!banner) {
        return next(new AppError('Không tìm thấy banner', HTTP_CODES.NOT_FOUND));
    }

    await banner.destroy();

    res.status(200).json({
        status: 'success',
        message: 'Xóa banner thành công',
    });
});

module.exports = {
    login,
    getAllTours,
    getTourById,
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
    getAllBanners,
    createBanner,
    updateBanner,
    deleteBanner,
};
