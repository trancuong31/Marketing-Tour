const { Tour, TourImage, Category } = require('../models');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');

/**
 * Lấy danh sách tour, lọc theo type (domestic|international)
 * GET /api/tours?type=domestic|international
 */
const getTours = catchAsync(async (req, res) => {
    const { type } = req.query;

    const whereClause = { status: 'active' };

    // Nếu có filter theo type
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
            // Không có category nào khớp → trả rỗng
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
 * Lấy chi tiết tour theo slug (kèm ảnh gallery)
 * GET /api/tours/:slug
 */
const getTourBySlug = catchAsync(async (req, res, next) => {
    const { slug } = req.params;

    const tour = await Tour.findOne({
        where: { slug, status: 'active' },
        include: [
            { model: Category, attributes: ['id', 'name', 'slug', 'is_international'] },
            { model: TourImage, as: 'images', attributes: ['id', 'image_url', 'sort_order'], order: [['sort_order', 'ASC']] },
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

module.exports = { getTours, getTourBySlug };
