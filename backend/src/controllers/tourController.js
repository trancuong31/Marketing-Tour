const { Op, Sequelize } = require('sequelize');
const { Tour, TourImage, TourItinerary, TourDeparture, TourPickupLocation, TourOption, Category, Banner, TourTranslation, CategoryTranslation, TourItineraryTranslation } = require('../models');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');
const { normalizePublicUploadUrl, resolveExistingUploadUrl } = require('../utils/uploadUrl');
const { getTodayDateString } = require('../utils/date');
const logger = require('../config/logger');
const { resolveLocalizedFields, resolveTourContentForLocale } = require('../utils/tourLocaleContent');

const applyTourLocaleContent = (data, language) => {
    const translation = data.translations?.find((item) => item.language === language);
    const resolved = resolveTourContentForLocale({
        source: data,
        translation,
        language,
    });
    Object.assign(data, resolved.content);
    data.locale_content_status = resolved.status;

    const unavailableFields = Object.entries(resolved.status)
        .filter(([, status]) => status !== 'available')
        .map(([field]) => field);
    if (unavailableFields.length > 0) {
        logger.warn('Tour locale content is missing or unverified', {
            tour_id: data.id,
            language,
            fields: unavailableFields,
        });
    }
};

const applyItineraryLocaleContent = (itinerary, language) => {
    const translation = itinerary.translations?.find((item) => item.language === language);
    const resolved = resolveLocalizedFields({
        source: itinerary,
        translation,
        language,
        fields: ['title', 'content'],
    });
    Object.assign(itinerary, resolved.content);
    itinerary.locale_content_status = resolved.status;

    const unavailableFields = Object.entries(resolved.status)
        .filter(([, status]) => status !== 'available')
        .map(([field]) => field);
    if (unavailableFields.length > 0) {
        logger.warn('Tour itinerary locale content is missing or unverified', {
            tour_id: itinerary.tour_id,
            itinerary_id: itinerary.id,
            language,
            fields: unavailableFields,
        });
    }
};

const applyCategoryLocaleContent = (category, language) => {
    if (!category) return;

    const translation = category.translations?.find((item) => item.language === language);
    const resolved = resolveLocalizedFields({
        source: category,
        translation,
        language,
        fields: ['name'],
    });
    Object.assign(category, resolved.content);
    category.locale_content_status = resolved.status;

    if (language !== 'vi') {
        category.slug = translation?.slug || null;
    }
    if (resolved.status.name !== 'available') {
        logger.warn('Tour category locale content is missing or unverified', {
            category_id: category.id,
            language,
            fields: ['name'],
        });
    }
};

/**
 * Lấy danh sách tour, lọc theo type (domestic|international)
 * Bao gồm departures để hiển thị giá thấp nhất
 * GET /api/tours?type=domestic|international
 */
const getTours = catchAsync(async (req, res) => {
    const { type, q, date, budget } = req.query;

    res.vary('x-language');
    const lang = req.language || 'vi';
    const shouldUseTranslation = lang !== 'vi';
    const whereClause = { status: 'active' };

    if (q) {
        if (shouldUseTranslation) {
            whereClause['$translations.title$'] = {
                [Op.like]: `%${q}%`
            };
        } else {
            whereClause.title = {
                [Op.like]: `%${q}%`
            };
        }
    }
    if (type === 'domestic' || type === 'international') {
        const isInternational = type === 'international' ? 1 : 0;
        const categories = await Category.findAll({
            where: { is_international: isInternational },
            attributes: ['id'],
        });
        const categoryIds = categories.map(c => c.id);

        if (categoryIds.length > 0) {
            whereClause.category_id = categoryIds;
        } else {
            return res.status(200).json({ status: 'success', results: 0, data: [] });
        }
    }

    const formattedToday = getTodayDateString();

    const departureWhere = {
        status: 'open'
    };

    if (date) {
        departureWhere.departure_date = date;
    } else {
        departureWhere.departure_date = { [Op.gte]: formattedToday };
    }
    if (budget) {
        switch (budget) {
            case 'under_5M':
                departureWhere.price_adult = { [Op.lt]: 5000000 };
                break;
            case '5M_10M':
                departureWhere.price_adult = { [Op.between]: [5000000, 10000000] };
                break;
            case '10M_20M':
                departureWhere.price_adult = { [Op.between]: [10000001, 20000000] };
                break;
            case 'over_20M':
                departureWhere.price_adult = { [Op.gt]: 20000000 };
                break;
        }
    }

    const isDepartureRequired = !!(date || budget);
    // ==========================================
    const tours = await Tour.findAll({
        where: whereClause,
        include: [
            {
                model: TourTranslation,
                as: 'translations',
                where: { language: lang },
                required: shouldUseTranslation && !!q
            },
            {
                model: Category,
                attributes: ['id', 'name', 'slug', 'is_international'],
                include: [
                    { model: CategoryTranslation, as: 'translations', where: { language: lang }, required: false }
                ]
            },
            {
                model: TourImage,
                as: 'images',
                attributes: ['id', 'image_url', 'sort_order'],
                separate: true,
                limit: 1,
                order: [['sort_order', 'ASC']]
            },
            {
                model: TourDeparture,
                as: 'departures',
                attributes: ['id', 'tour_id', 'departure_date', 'price_adult', 'status'],
                where: departureWhere,
                required: isDepartureRequired,
                order: [['price_adult', 'ASC']],
            },
        ],
        order: [['tour_badge', 'DESC'], ['id', 'DESC']],
    });

    const resultData = tours.map(t => {
        const data = t.toJSON();
        data.thumbnail_url = resolveExistingUploadUrl(data.thumbnail_url);
        data.images = (data.images || []).map(image => ({
            ...image,
            image_url: resolveExistingUploadUrl(image.image_url),
        }));
        applyTourLocaleContent(data, lang);
        if (shouldUseTranslation) {
            const tr = data.translations?.find((item) => item.language === lang);
            data.slug = tr?.slug || null;
        }
        delete data.translations;

        applyCategoryLocaleContent(data.Category, lang);
        if (data.Category) delete data.Category.translations;
        return data;
    });

    res.status(200).json({
        status: 'success',
        results: resultData.length,
        data: resultData,
    });
});

const getTourBySlug = catchAsync(async (req, res, next) => {
    const { slug } = req.params;
    res.vary('x-language');
    const lang = req.language || 'vi';
    const shouldUseTranslation = lang !== 'vi';

    const formattedToday = getTodayDateString();

    const tour = await Tour.findOne({
        where: {
            status: 'active',
            [Op.or]: [
                { slug },
                { '$translations.slug$': slug },
            ],
        },
        subQuery: false,
        include: [
            {
                model: TourTranslation,
                as: 'translations',
                where: { language: lang },
                required: false,
            },
            {
                model: Category,
                attributes: ['id', 'name', 'slug', 'is_international'],
                include: [{ model: CategoryTranslation, as: 'translations', where: { language: lang }, required: false }]
            },
            {
                model: TourImage,
                as: 'images',
                attributes: ['id', 'image_url', 'sort_order'],
                separate: true,
                order: [['sort_order', 'ASC']],
            },
            {
                model: TourItinerary,
                as: 'itineraries',
                separate: true,
                order: [['day_number', 'ASC']],
                include: [{ model: TourItineraryTranslation, as: 'translations', where: { language: lang }, required: false }]
            },
            {
                model: TourDeparture,
                as: 'departures',
                where: { status: 'open', departure_date: { [Op.gte]: formattedToday } },
                required: false,
                separate: true,
                order: [['departure_date', 'ASC']],
            },
            { model: TourPickupLocation, as: 'pickupLocations', separate: true },
            { model: TourOption, as: 'options', separate: true },
        ],
    });

    if (!tour) {
        return next(new AppError('Không tìm thấy tour này', HTTP_CODES.NOT_FOUND));
    }

    const data = tour.toJSON();
    data.thumbnail_url = resolveExistingUploadUrl(data.thumbnail_url);
    data.images = (data.images || []).map(image => ({
        ...image,
        image_url: resolveExistingUploadUrl(image.image_url),
    }));
    applyTourLocaleContent(data, lang);
    if (shouldUseTranslation) {
        const tr = data.translations?.find((item) => item.language === lang);
        data.slug = tr?.slug || null;
    }
    delete data.translations;

    applyCategoryLocaleContent(data.Category, lang);
    if (data.Category) delete data.Category.translations;

    if (data.itineraries) {
        data.itineraries = data.itineraries.map(iti => {
            applyItineraryLocaleContent(iti, lang);
            delete iti.translations;
            return iti;
        });
    }

    res.status(200).json({
        status: 'success',
        data: data,
    });
});

const getBannersByPosition = catchAsync(async (req, res) => {
    const { position } = req.query;
    const lang = req.language || 'vi';
    const whereClause = { is_active: 1 };
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    if (position) {
        whereClause.position = position;
    }

    const banners = await Banner.findAll({
        where: whereClause,
        attributes: ['id', 'title', 'image_url', 'target_link', 'position'],
        include: [
            {
                model: Tour,
                as: 'tour',
                attributes: ['id', 'title', 'slug'],
                required: false,
                include: [
                    {
                        model: TourTranslation,
                        as: 'translations',
                        where: { language: lang },
                        required: false,
                    },
                    {
                        model: TourDeparture,
                        as: 'departures',
                        attributes: ['id', 'price_adult'],
                        where: { status: 'open', departure_date: { [Op.gte]: formattedToday } },
                        required: false,
                        order: [['price_adult', 'ASC']]
                    },
                ],
            },
        ],
        order: [['id', 'DESC']],
    });

    const data = banners.map((banner) => {
        const item = banner.toJSON();
        const translation = item.tour?.translations?.[0];
        item.image_url = normalizePublicUploadUrl(item.image_url);

        if (translation) {
            item.title = translation.title || item.title;
            item.tour.title = translation.title || item.tour.title;
            item.tour.slug = translation.slug || item.tour.slug;

            if (item.target_link?.startsWith('/tours/')) {
                item.target_link = `/tours/${item.tour.slug}`;
            }
        }

        if (item.tour) {
            delete item.tour.translations;
        }

        return item;
    });

    res.status(200).json({
        status: 'success',
        results: data.length,
        data,
    });
});

const getDistinctPickupLocations = catchAsync(async (req, res) => {
    const locations = await TourPickupLocation.findAll({
        attributes: [
            [Sequelize.fn('DISTINCT', Sequelize.col('location_name')), 'location_name']
        ],
        where: {
            location_name: {
                [Op.not]: null,
                [Op.ne]: ''
            }
        },
        order: [['location_name', 'ASC']],
        raw: true
    });

    const data = locations.map(loc => loc.location_name);

    res.status(200).json({
        status: 'success',
        results: data.length,
        data: data,
    });
});

module.exports = { getTours, getTourBySlug, getBannersByPosition, getDistinctPickupLocations };
