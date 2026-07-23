const { Op, Sequelize } = require('sequelize');
const { Tour, TourImage, TourItinerary, TourDeparture, TourPickupLocation, TourOption, Category, Banner, TourTranslation, CategoryTranslation, TourItineraryTranslation } = require('../models');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');
const { normalizePublicUploadUrl } = require('../utils/uploadUrl');

/**
 * Lấy danh sách tour, lọc theo type (domestic|international)
 * Bao gồm departures để hiển thị giá thấp nhất
 * GET /api/tours?type=domestic|international
 */
const getTours = catchAsync(async (req, res) => {
    const { type, q, date, budget } = req.query;

    const lang = req.language || 'vi';
    const whereClause = { status: 'active' };

    if (q) {
        whereClause['$translations.title$'] = {
            [Op.like]: `%${q}%`
        };
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

    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    
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
                required: !!q 
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
        if (data.translations && data.translations.length > 0) {
            const tr = data.translations[0];
            data.title = tr.title || data.title;
            data.slug = tr.slug || data.slug;
            data.summary = tr.summary || data.summary;
        }
        delete data.translations;

        if (data.Category && data.Category.translations && data.Category.translations.length > 0) {
            const ctr = data.Category.translations[0];
            data.Category.name = ctr.name || data.Category.name;
            data.Category.slug = ctr.slug || data.Category.slug;
            delete data.Category.translations;
        }
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
    const lang = req.language || 'vi';

    const tour = await Tour.findOne({
        where: { 
            status: 'active',
            [Op.or]: [
                { slug: slug },
                { '$translations.slug$': slug }
            ]
        },
        subQuery: false,
        include: [
            { model: TourTranslation, as: 'translations', where: { language: lang }, required: false },
            { 
                model: Category, 
                attributes: ['id', 'name', 'slug', 'is_international'],
                include: [{ model: CategoryTranslation, as: 'translations', where: { language: lang }, required: false }]
            },
            { model: TourImage, as: 'images', attributes: ['id', 'image_url', 'sort_order'], order: [['sort_order', 'ASC']] },
            { 
                model: TourItinerary, 
                as: 'itineraries', 
                order: [['day_number', 'ASC']],
                include: [{ model: TourItineraryTranslation, as: 'translations', where: { language: lang }, required: false }]
            },
            {
                model: TourDeparture,
                as: 'departures',
                where: { status: 'open', departure_date: { [Op.gte]: new Date() } },
                required: false,
                order: [['departure_date', 'ASC']],
            },
            { model: TourPickupLocation, as: 'pickupLocations' },
            { model: TourOption, as: 'options' },
        ],
    });

    if (!tour) {
        return next(new AppError('Không tìm thấy tour này', HTTP_CODES.NOT_FOUND));
    }

    const data = tour.toJSON();
    if (data.translations && data.translations.length > 0) {
        const tr = data.translations[0];
        data.title = tr.title || data.title;
        data.slug = tr.slug || data.slug;
        data.summary = tr.summary || data.summary;
        data.highlights = tr.highlights || data.highlights;
        data.price_includes = tr.price_includes || data.price_includes;
        data.price_excludes = tr.price_excludes || data.price_excludes;
        data.terms_and_notes = tr.terms_and_notes || data.terms_and_notes;
        data.cancellation_policy = tr.cancellation_policy || data.cancellation_policy;
    }
    delete data.translations;

    if (data.Category && data.Category.translations && data.Category.translations.length > 0) {
        const ctr = data.Category.translations[0];
        data.Category.name = ctr.name || data.Category.name;
        data.Category.slug = ctr.slug || data.Category.slug;
        delete data.Category.translations;
    }

    if (data.itineraries) {
        data.itineraries = data.itineraries.map(iti => {
            if (iti.translations && iti.translations.length > 0) {
                const itr = iti.translations[0];
                iti.title = itr.title || iti.title;
                iti.content = itr.content || iti.content;
            }
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
