const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const slugify = require('slugify');
const { sequelize } = require('../config/database');
const {
    User, Role, Tour, TourImage, TourItinerary, TourDeparture,
    TourPickupLocation, TourOption, Booking, BookingOption, Vote, Guide, Category, Banner, Notification,
    TourTranslation, TourItineraryTranslation, GuideTranslation,
} = require('../models');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');
const env = require('../config/env');
const { translateTexts } = require('../services/translationService');

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

const AUTO_TRANSLATION_LANGUAGES = ['en', 'zh'];
const TOUR_TRANSLATABLE_FIELDS = [
    'title',
    'summary',
    'highlights',
    'price_includes',
    'price_excludes',
    'terms_and_notes',
    'cancellation_policy',
];

const hasText = (value) => typeof value === 'string' && value.trim().length > 0;

const buildTourTranslationSource = ({
    title,
    summary,
    highlights,
    price_includes,
    price_excludes,
    terms_and_notes,
    cancellation_policy,
}) => ({
    title,
    summary,
    highlights,
    price_includes,
    price_excludes,
    terms_and_notes,
    cancellation_policy,
});

const mergeTranslatedFields = (source, existingTranslation, translatedFields) => {
    const merged = { ...existingTranslation };

    Object.keys(source).forEach((field) => {
        if (!hasText(merged[field])) {
            merged[field] = translatedFields[field] || source[field] || '';
        }
    });

    return merged;
};

const ensureTourTranslations = async ({ translations, source, slug }) => {
    const existingTranslations = parseJsonField(translations);

    return Promise.all(AUTO_TRANSLATION_LANGUAGES.map(async (language) => {
        const existing = existingTranslations.find(item => item.language === language) || { language };
        const missingFields = Object.fromEntries(
            TOUR_TRANSLATABLE_FIELDS
                .filter(field => hasText(source[field]) && !hasText(existing[field]))
                .map(field => [field, source[field]]),
        );

        const translatedFields = Object.keys(missingFields).length > 0
            ? await translateTexts({ texts: missingFields, targetLang: language })
            : {};

        return {
            ...mergeTranslatedFields(source, existing, translatedFields),
            language,
            slug: existing.slug || slug,
        };
    }));
};

const ensureItineraryTranslations = async (itinerary) => {
    const existingTranslations = Array.isArray(itinerary.translations) ? itinerary.translations : [];

    const translations = await Promise.all(AUTO_TRANSLATION_LANGUAGES.map(async (language) => {
        const existing = existingTranslations.find(item => item.language === language) || { language };
        const missingFields = {};

        if (hasText(itinerary.title) && !hasText(existing.title)) {
            missingFields.title = itinerary.title;
        }

        if (hasText(itinerary.content) && !hasText(existing.content)) {
            missingFields.content = itinerary.content;
        }

        const translatedFields = Object.keys(missingFields).length > 0
            ? await translateTexts({ texts: missingFields, targetLang: language })
            : {};

        return {
            language,
            title: existing.title || translatedFields.title || itinerary.title || '',
            content: existing.content || translatedFields.content || itinerary.content || '',
        };
    }));

    return {
        ...itinerary,
        translations,
    };
};

const ensureTranslatedItineraries = (itineraries) => (
    Promise.all(parseJsonField(itineraries).map(ensureItineraryTranslations))
);

// ══════════════════════════════════════
// TOUR CRUD
// ══════════════════════════════════════

/**
 * Lấy tất cả tours (admin) - kèm departures để hiện giá
 * GET /api/admin/tours
 */
const getAllTours = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;

    const limitNum = parseInt(limit, 10);
    const pageNum = parseInt(page, 10);
    const offset = (pageNum - 1) * limitNum;

    const whereClause = {};
    if (search && search.trim()) {
        whereClause.title = { [Op.like]: `%${search.trim()}%` };
    }

    const { count, rows } = await Tour.findAndCountAll({
        where: whereClause,
        include: [
            { model: Category, attributes: ['id', 'name'] },
            { model: TourImage, as: 'images', attributes: ['id', 'image_url', 'sort_order'] },
            { model: TourDeparture, as: 'departures', attributes: ['id', 'departure_date', 'price_adult', 'available_seats', 'status'] },
        ],
        order: [['id', 'DESC']],
        limit: limitNum,
        offset: offset,
        distinct: true,
    });

    res.status(200).json({
        status: 'success',
        results: rows.length,
        totalItems: count,
        totalPages: Math.ceil(count / limitNum),
        currentPage: pageNum,
        data: rows,
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
            {
                model: TourItinerary,
                as: 'itineraries',
                order: [['day_number', 'ASC']],
                include: [{ model: TourItineraryTranslation, as: 'translations' }],
            },
            { model: TourDeparture, as: 'departures', order: [['departure_date', 'ASC']] },
            { model: TourPickupLocation, as: 'pickupLocations' },
            { model: TourOption, as: 'options' },
            { model: TourTranslation, as: 'translations' },
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
        translations, // Array of translations for the tour (en, zh)
    } = req.body;

    if (!title || !category_id) {
        return next(new AppError('Tiêu đề và danh mục là bắt buộc', HTTP_CODES.BAD_REQUEST));
    }

    const slug = slugify(title, { lower: true, strict: true, locale: 'vi' });
    const existingSlug = await Tour.findOne({ where: { slug } });
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;
    const translatedTourContent = await ensureTourTranslations({
        translations,
        source: buildTourTranslationSource({
            title,
            summary,
            highlights,
            price_includes,
            price_excludes,
            terms_and_notes,
            cancellation_policy,
        }),
        slug: finalSlug,
    });
    const translatedItineraries = await ensureTranslatedItineraries(itineraries);

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
        if (translatedItineraries.length > 0) {
            for (const item of translatedItineraries) {
                const iti = await TourItinerary.create({
                    tour_id: tour.id,
                    day_number: item.day_number,
                    title: item.title,
                    content: item.content,
                }, { transaction: t });

                if (item.translations && item.translations.length > 0) {
                    await TourItineraryTranslation.bulkCreate(
                        item.translations.map(tr => ({
                            itinerary_id: iti.id,
                            language: tr.language,
                            title: tr.title || item.title,
                            content: tr.content || item.content,
                        })),
                        { transaction: t }
                    );
                }
            }
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

        // 7. Tour Translations
        if (translatedTourContent.length > 0) {
            await TourTranslation.bulkCreate(
                translatedTourContent.map((item) => ({
                    tour_id: tour.id,
                    language: item.language,
                    title: item.title || title,
                    slug: item.slug || finalSlug,
                    summary: item.summary || null,
                    highlights: item.highlights || null,
                    price_includes: item.price_includes || null,
                    price_excludes: item.price_excludes || null,
                    terms_and_notes: item.terms_and_notes || null,
                    cancellation_policy: item.cancellation_policy || null,
                })),
                { transaction: t }
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
        translations,
    } = req.body;

    // Nếu đổi title → tạo slug mới
    let newSlug = tour.slug;
    if (title && title !== tour.title) {
        newSlug = slugify(title, { lower: true, strict: true, locale: 'vi' });
        const existingSlug = await Tour.findOne({ where: { slug: newSlug, id: { [Op.ne]: id } } });
        if (existingSlug) newSlug = `${newSlug}-${Date.now()}`;
    }

    const translatedTourContent = await ensureTourTranslations({
        translations,
        source: buildTourTranslationSource({
            title: title || tour.title,
            summary: summary !== undefined ? summary : tour.summary,
            highlights: highlights !== undefined ? highlights : tour.highlights,
            price_includes: price_includes !== undefined ? price_includes : tour.price_includes,
            price_excludes: price_excludes !== undefined ? price_excludes : tour.price_excludes,
            terms_and_notes: terms_and_notes !== undefined ? terms_and_notes : tour.terms_and_notes,
            cancellation_policy: cancellation_policy !== undefined ? cancellation_policy : tour.cancellation_policy,
        }),
        slug: newSlug,
    });
    const translatedItineraries = itineraries !== undefined
        ? await ensureTranslatedItineraries(itineraries)
        : null;

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
            if (translatedItineraries.length > 0) {
                for (const item of translatedItineraries) {
                    const iti = await TourItinerary.create({
                        tour_id: id,
                        day_number: item.day_number,
                        title: item.title,
                        content: item.content,
                    }, { transaction: t });

                    if (item.translations && item.translations.length > 0) {
                        await TourItineraryTranslation.bulkCreate(
                            item.translations.map(tr => ({
                                itinerary_id: iti.id,
                                language: tr.language,
                                title: tr.title || item.title,
                                content: tr.content || item.content,
                            })),
                            { transaction: t }
                        );
                    }
                }
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

        await TourTranslation.destroy({ where: { tour_id: id }, transaction: t });
        if (translatedTourContent.length > 0) {
            await TourTranslation.bulkCreate(
                translatedTourContent.map((item) => ({
                    tour_id: id,
                    language: item.language,
                    title: item.title,
                    slug: item.slug || newSlug,
                    summary: item.summary || null,
                    highlights: item.highlights || null,
                    price_includes: item.price_includes || null,
                    price_excludes: item.price_excludes || null,
                    terms_and_notes: item.terms_and_notes || null,
                    cancellation_policy: item.cancellation_policy || null,
                })),
                { transaction: t }
            );
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
 * Tổng quan đơn đặt theo tour (admin dashboard)
 * GET /api/admin/bookings/overview
 */
const getBookingOverview = catchAsync(async (req, res) => {
    const tours = await Tour.findAll({
        attributes: ['id', 'title', 'slug', 'thumbnail_url'],
        include: [{
            model: Booking,
            as: 'bookings',
            attributes: ['id', 'status'],
        }],
        order: [
            [{ model: Booking, as: 'bookings' }, 'status', 'ASC'],
            ['id', 'DESC'],
        ]
    });

    const data = tours
        .map(tour => {
            const bookings = tour.bookings || [];
            const total = bookings.length;
            const pending = bookings.filter(b => b.status === 'pending').length;
            const approved = bookings.filter(b => b.status === 'approved').length;
            const cancelled = bookings.filter(b => b.status === 'cancelled').length;
            return {
                id: tour.id,
                title: tour.title,
                slug: tour.slug,
                thumbnail_url: tour.thumbnail_url,
                total, pending, approved, cancelled,
            };
        })
        .filter(t => t.total > 0 || t.pending > 0);

    res.status(200).json({ status: 'success', data });
});

/**
 * Lấy danh sách đơn đặt tour (admin)
 * GET /api/admin/bookings?status=...&tour_id=...&search=...&page=1&limit=10
 */
const getBookings = catchAsync(async (req, res) => {
    const { status, tour_id, search, page = 1, limit = 10 } = req.query;
    const whereClause = {};
    if (status) whereClause.status = status;
    if (tour_id) whereClause.tour_id = tour_id;

    if (search) {
        whereClause[Op.or] = [
            { customer_name: { [Op.like]: `%${search}%` } },
            { customer_phone: { [Op.like]: `%${search}%` } },
            { booking_code: { [Op.like]: `%${search}%` } },
        ];
    }

    const limitNum = parseInt(limit, 10) || 10;
    const pageNum = parseInt(page, 10) || 1;
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await Booking.findAndCountAll({
        where: whereClause,
        include: [
            { model: Tour, attributes: ['id', 'title', 'slug'] },
            { model: TourDeparture, as: 'departure', attributes: ['id', 'departure_date', 'price_adult'] },
            { model: TourPickupLocation, as: 'pickupLocation', attributes: ['id', 'location_name', 'surcharge_amount'] },
            { model: BookingOption, as: 'bookingOptions' },
        ],
        order: [['created_at', 'DESC']],
        limit: limitNum,
        offset: offset,
        distinct: true,
    });

    const data = rows.map(b => ({
        id: b.id,
        booking_code: b.booking_code,
        customer_name: b.customer_name,
        customer_phone: b.customer_phone,
        customer_email: b.customer_email,
        adult_qty: b.adult_qty,
        child_qty: b.child_qty,
        infant_qty: b.infant_qty,
        total_price: b.total_price,
        customer_note: b.customer_note,
        status: b.status,
        admin_note: b.admin_note,
        created_at: b.created_at,
        updated_at: b.updated_at,
        tour_id: b.tour_id,
        departure_id: b.departure_id,
        user_id: b.user_id,

        // Snapshot fields
        tour_title_snapshot: b.tour_title_snapshot,
        departure_date_snapshot: b.departure_date_snapshot,
        adult_price_snapshot: b.adult_price_snapshot,
        child_price_snapshot: b.child_price_snapshot,
        infant_price_snapshot: b.infant_price_snapshot,
        pickup_location_snapshot: b.pickup_location_snapshot,
        pickup_price_snapshot: b.pickup_price_snapshot,

        Tour: b.Tour ? {
            id: b.Tour.id,
            title: b.Tour.title,
            slug: b.Tour.slug,
        } : null,
        departure: b.departure ? {
            id: b.departure.id,
            departure_date: b.departure.departure_date,
            price_adult: b.departure.price_adult,
        } : null,
        pickupLocation: b.pickupLocation ? {
            id: b.pickupLocation.id,
            location_name: b.pickupLocation.location_name,
            surcharge_amount: b.pickupLocation.surcharge_amount,
        } : null,
        bookingOptions: b.bookingOptions || [],
    }));

    res.status(200).json({
        status: 'success',
        results: data.length,
        totalItems: count,
        totalPages: Math.ceil(count / limitNum),
        currentPage: pageNum,
        data,
    });
});

/**
 * Cập nhật trạng thái đơn đặt
 * PUT /api/admin/bookings/:id/status
 */
const updateBookingStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status, admin_note } = req.body;

    const validStatuses = ['pending', 'approved', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return next(new AppError('Trạng thái không hợp lệ', HTTP_CODES.BAD_REQUEST));
    }

    const booking = await Booking.findByPk(id, {
        include: [{ model: Tour, attributes: ['title', 'slug'] }]
    });
    
    if (!booking) {
        return next(new AppError('Không tìm thấy đơn đặt', HTTP_CODES.NOT_FOUND));
    }

    const oldStatus = booking.status;
    await sequelize.transaction(async (t) => {
        await booking.update({
            status,
            admin_note: admin_note !== undefined ? admin_note : booking.admin_note,
        }, { transaction: t });

        // Logic cập nhật số chỗ trống
        const totalPassengers = (booking.adult_qty || 0) + (booking.child_qty || 0) + (booking.infant_qty || 0);

        // 1. Admin hủy đơn (pending/approved -> cancelled) => Khôi phục chỗ trống
        if (status === 'cancelled' && oldStatus !== 'cancelled') {
            const departure = await TourDeparture.findByPk(booking.departure_id, { transaction: t });
            if (departure) {
                const isLimited = departure.available_seats > 0 || departure.status === 'full';
                if (isLimited) {
                    const newSeats = departure.available_seats + totalPassengers;
                    await departure.update({
                        available_seats: newSeats,
                        status: 'open'
                    }, { transaction: t });
                }
            }
        }

        // 2. Admin khôi phục đơn đã hủy (cancelled -> pending/approved) => Giảm chỗ trống
        if (oldStatus === 'cancelled' && status !== 'cancelled') {
            const departure = await TourDeparture.findByPk(booking.departure_id, { transaction: t });
            if (departure && departure.available_seats > 0) { // Nếu tour có giới hạn chỗ
                if (departure.available_seats < totalPassengers) {
                    throw new AppError(`Không đủ chỗ trống để khôi phục đơn (còn ${departure.available_seats} chỗ).`, HTTP_CODES.BAD_REQUEST);
                }
                const newSeats = departure.available_seats - totalPassengers;
                await departure.update({
                    available_seats: newSeats,
                    status: newSeats === 0 ? 'full' : 'open'
                }, { transaction: t });
            }
        }
    });

    // Nếu trạng thái chuyển thành 'approved', tạo thông báo cho user
    if (status === 'approved' && oldStatus !== 'approved' && booking.user_id) {
        await Notification.create({
            user_id: booking.user_id,
            type: 'booking',
            sender_name: 'Hệ thống',
            message: `đơn đặt tour "${booking.Tour?.title}" của bạn đã được duyệt`,
            related_id: booking.id,
            related_slug: booking.Tour.slug
        });
    }

    res.status(200).json({
        status: 'success',
        message: 'Cập nhật trạng thái thành công',
        data: booking,
    });
});

/**
 * Xóa đơn đặt (chỉ cho phép khi ở trạng thái cancelled)
 * DELETE /api/admin/bookings/:id
 */
const deleteBooking = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const booking = await Booking.findByPk(id);
    if (!booking) {
        return next(new AppError('Không tìm thấy đơn đặt', HTTP_CODES.NOT_FOUND));
    }

    if (booking.status !== 'cancelled') {
        return next(new AppError('Chỉ có thể xóa các đơn đặt đã bị hủy', HTTP_CODES.BAD_REQUEST));
    }

    await booking.destroy();

    res.status(200).json({
        status: 'success',
        message: 'Xóa đơn đặt thành công',
    });
});

// ══════════════════════════════════════
// VOTE MANAGEMENT
// ══════════════════════════════════════

const getTimeFilter = (time) => {
    if (!time) return null;

    if (time === '7days') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return { [Op.gte]: d };
    }
    if (time === 'month') {
        const d = new Date();
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return { [Op.gte]: d };
    }
    if (time === 'quarter') {
        const d = new Date();
        const currentMonth = d.getMonth();
        const startOfQuarter = currentMonth - (currentMonth % 3);
        d.setMonth(startOfQuarter, 1);
        d.setHours(0, 0, 0, 0);
        return { [Op.gte]: d };
    }
    if (time === 'year') {
        const d = new Date();
        d.setMonth(0, 1);
        d.setHours(0, 0, 0, 0);
        return { [Op.gte]: d };
    }

    // Dynamic exact year (e.g. year_2024)
    if (time.startsWith('year_')) {
        const year = parseInt(time.split('_')[1], 10);
        if (!isNaN(year)) {
            const start = new Date(year, 0, 1);
            const end = new Date(year + 1, 0, 1);
            return {
                [Op.gte]: start,
                [Op.lt]: end
            }; 
        }
    }

    // Dynamic exact quarter (e.g. q1_2024)
    if (time.startsWith('q')) {
        const parts = time.split('_');
        const q = parseInt(parts[0].replace('q', ''), 10);
        const year = parseInt(parts[1], 10);

        if (!isNaN(q) && !isNaN(year) && q >= 1 && q <= 4) {
            const startMonth = (q - 1) * 3;
            // new Date correctly rolls over if endMonth is 12 -> Jan next year
            const start = new Date(year, startMonth, 1);
            const end = new Date(year, startMonth + 3, 1); 
            return {
                [Op.gte]: start,
                [Op.lt]: end
            };
        }
    }

    return null;
};

const getVotes = catchAsync(async (req, res) => {
    const { approved, tour_id, time, page = 1, limit = 10 } = req.query;
    const whereClause = {};
    
    if (approved !== undefined) whereClause.is_approved = parseInt(approved);
    if (tour_id) whereClause.tour_id = tour_id;
    
    const timeFilter = getTimeFilter(time);
    if (timeFilter) whereClause.created_at = timeFilter;

    const limitNum = parseInt(limit, 10);
    const pageNum = parseInt(page, 10);
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await Vote.findAndCountAll({
        where: whereClause,
        include: [{ model: Tour, attributes: ['id', 'title', 'slug'] }],
        order: [['created_at', 'DESC']],
        limit: limitNum,
        offset: offset,
    });

    res.status(200).json({
        status: 'success',
        results: rows.length,
        totalItems: count,
        totalPages: Math.ceil(count / limitNum),
        currentPage: pageNum,
        data: rows,
    });
});

const updateVoteStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { is_approved } = req.body;

    const vote = await Vote.findByPk(id);
    if (!vote) return next(new AppError('Không tìm thấy đánh giá', HTTP_CODES.NOT_FOUND));

    await vote.update({ is_approved: is_approved ? 1 : 0 });

    res.status(200).json({
        status: 'success',
        message: is_approved ? 'Đã duyệt đánh giá' : 'Đã từ chối đánh giá',
        data: vote,
    });
});

const replyToVote = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { reply } = req.body;

    const vote = await Vote.findByPk(id);
    if (!vote) return next(new AppError('Không tìm thấy đánh giá', HTTP_CODES.NOT_FOUND));

    await vote.update({
        admin_reply: reply,
        admin_reply_at: new Date(),
    });

    res.status(200).json({
        status: 'success',
        message: 'Đã trả lời đánh giá thành công',
        data: vote,
    });
});

const deleteVote = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const vote = await Vote.findByPk(id);
    
    if (!vote) return next(new AppError('Không tìm thấy đánh giá', HTTP_CODES.NOT_FOUND));

    await vote.destroy();

    res.status(200).json({
        status: 'success',
        message: 'Đã xóa đánh giá thành công',
    });
});

const getTopRatedTours = catchAsync(async (req, res) => {
    const { time } = req.query;
    const whereClause = {};

    const timeFilter = getTimeFilter(time);
    if (timeFilter) whereClause.created_at = timeFilter;

    // Lấy top 5 tour có xếp hạng trung bình cao nhất (điều kiện có ít nhất 1 rating)
    const topTours = await Vote.findAll({
        where: whereClause,
        attributes: [
            [sequelize.fn('AVG', sequelize.col('Vote.rating')), 'avgRating'],
            [sequelize.fn('COUNT', sequelize.col('Vote.id')), 'reviewCount']
        ],
        include: [{ model: Tour, attributes: ['id', 'title'] }],
        group: ['Vote.tour_id', 'Tour.id', 'Tour.title'],
        order: [[sequelize.literal('avgRating'), 'DESC'], [sequelize.literal('reviewCount'), 'DESC']],
        limit: 5
    });

    res.status(200).json({
        status: 'success',
        data: topTours,
    });
});

const getReviewStats = catchAsync(async (req, res) => {
    const { tour_id, time } = req.query;
    const whereClause = {};
    
    if (tour_id) whereClause.tour_id = tour_id;
    const timeFilter = getTimeFilter(time);
    if (timeFilter) whereClause.created_at = timeFilter;

    const stats = await Vote.findAll({
        where: whereClause,
        attributes: [
            'rating',
            [sequelize.fn('COUNT', sequelize.col('Vote.id')), 'count']
        ],
        group: ['rating'],
        order: [['rating', 'DESC']]
    });

    res.status(200).json({
        status: 'success',
        data: stats,
    });
});

// ══════════════════════════════════════
// GUIDE MANAGEMENT
// ══════════════════════════════════════

const GUIDE_TRANSLATION_LANGUAGES = ['en', 'zh'];

const upsertGuideTranslation = async ({ guide, language, title, slug, content, transaction }) => {
    await GuideTranslation.upsert({
        guide_id: guide.id,
        language,
        title,
        slug,
        content,
    }, { transaction });
};

const syncGuideTranslations = async ({ guide, title, slug, content, transaction }) => {
    await upsertGuideTranslation({
        guide,
        language: 'vi',
        title,
        slug,
        content,
        transaction,
    });

    await Promise.all(GUIDE_TRANSLATION_LANGUAGES.map(async (language) => {
        const translated = await translateTexts({
            targetLang: language,
            texts: {
                title,
                content,
            },
        });
        const translatedTitle = translated.title || title;

        await upsertGuideTranslation({
            guide,
            language,
            title: translatedTitle,
            slug: slugify(translatedTitle, { lower: true, strict: true }) || slug,
            content: translated.content || content,
            transaction,
        });
    }));
};

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

    const guide = await sequelize.transaction(async (transaction) => {
        const createdGuide = await Guide.create({
            title,
            slug: finalSlug,
            content,
            is_active: is_active !== undefined ? is_active : 1,
        }, { transaction });

        await syncGuideTranslations({
            guide: createdGuide,
            title,
            slug: finalSlug,
            content,
            transaction,
        });

        return createdGuide;
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

    const nextTitle = title || guide.title;
    const nextContent = content !== undefined ? content : guide.content;

    await sequelize.transaction(async (transaction) => {
        await guide.update({
            title: nextTitle,
            slug: newSlug,
            content: nextContent,
            is_active: is_active !== undefined ? is_active : guide.is_active,
        }, { transaction });

        await syncGuideTranslations({
            guide,
            title: nextTitle,
            slug: newSlug,
            content: nextContent,
            transaction,
        });
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

    const tourId = image.tour_id;
    const imageUrl = image.image_url;

    await image.destroy();

    // Nếu ảnh bị xóa là thumbnail -> cập nhật thumbnail mới (nếu còn ảnh khác)
    const tour = await Tour.findByPk(tourId);
    if (tour && tour.thumbnail_url === imageUrl) {
        const nextImage = await TourImage.findOne({ 
            where: { tour_id: tourId },
            order: [['sort_order', 'ASC']]
        });
        await tour.update({ thumbnail_url: nextImage ? nextImage.image_url : null });
    }

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
    getBookingOverview,
    updateBookingStatus,
    deleteBooking,
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
    deleteVote,
    replyToVote,
    getTopRatedTours,
    getReviewStats,
};
