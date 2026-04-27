const { Op, Sequelize } = require('sequelize');
const { Tour, TourImage, TourItinerary, TourDeparture, TourPickupLocation, TourOption, Category, Banner } = require('../models');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');

/**
 * Lấy danh sách tour, lọc theo type (domestic|international)
 * Bao gồm departures để hiển thị giá thấp nhất
 * GET /api/tours?type=domestic|international
 */
const getTours = catchAsync(async (req, res) => {
    const { type, q, date, budget } = req.query;

    const whereClause = { status: 'active' };

    if (q) {
        whereClause.title = {
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
                model: Category, 
                attributes: ['id', 'name', 'slug', 'is_international'] 
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

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: tours,
    });
});

const getTourBySlug = catchAsync(async (req, res, next) => {
    const { slug } = req.params;

    const tour = await Tour.findOne({
        where: { slug, status: 'active' },
        include: [
            { model: Category, attributes: ['id', 'name', 'slug', 'is_international'] },
            { model: TourImage, as: 'images', attributes: ['id', 'image_url', 'sort_order'], order: [['sort_order', 'ASC']] },
            { model: TourItinerary, as: 'itineraries', order: [['day_number', 'ASC']] },
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

    res.status(200).json({
        status: 'success',
        data: tour,
    });
});

const getBannersByPosition = catchAsync(async (req, res) => {
    const { position } = req.query;
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
                attributes: ['id', 'slug'],
                required: false,
                include: [
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

    res.status(200).json({
        status: 'success',
        results: banners.length,
        data: banners,
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
