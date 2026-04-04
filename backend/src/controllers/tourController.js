const { Op } = require('sequelize');
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
    const { type } = req.query;

    const whereClause = { status: 'active' };

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
            return res.status(200).json({
                status: 'success',
                results: 0,
                data: [],
            });
        }
    }

    const tours = await Tour.findAll({
        where: whereClause,
        include: [
            { model: Category, attributes: ['id', 'name', 'slug', 'is_international'] },
            { model: TourImage, as: 'images', attributes: ['id', 'image_url', 'sort_order'], limit: 1, order: [['sort_order', 'ASC']] },
            {
                model: TourDeparture,
                as: 'departures',
                attributes: ['id', 'departure_date', 'price_adult', 'status'],
                where: { status: 'open', departure_date: { [Op.gte]: new Date() } },
                required: false,
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

/**
 * Lấy chi tiết tour theo slug (kèm tất cả satellite data)
 * GET /api/tours/:slug
 */
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
        attributes: ['id', 'title', 'image_url', 'target_link', 'position', 'tour_id'],
        include: [
            {
                model: Tour,
                as: 'tour',
                attributes: ['slug'],
                required: false,
                include: [
                    {
                        model: TourDeparture,
                        as: 'departures',
                        attributes: ['id', 'tour_id', 'price_adult'],
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

module.exports = { getTours, getTourBySlug, getBannersByPosition };
