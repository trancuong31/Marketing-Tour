const { Guide } = require('../models');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');

/**
 * Lấy nội dung hướng dẫn theo slug
 * GET /api/guides/:slug
 */
const getGuideBySlug = catchAsync(async (req, res, next) => {
    const { slug } = req.params;

    const guide = await Guide.findOne({
        where: { slug, is_active: 1 },
    });

    if (!guide) {
        return next(new AppError('Không tìm thấy bài hướng dẫn', HTTP_CODES.NOT_FOUND));
    }

    res.status(200).json({
        status: 'success',
        data: guide,
    });
});

/**
 * Lấy danh sách tất cả hướng dẫn (chỉ title, slug)
 * GET /api/guides
 */
const getGuides = catchAsync(async (req, res) => {
    const guides = await Guide.findAll({
        where: { is_active: 1 },
        attributes: ['id', 'title', 'slug', 'updated_at'],
        order: [['updated_at', 'DESC']],
    });

    res.status(200).json({
        status: 'success',
        results: guides.length,
        data: guides,
    });
});

module.exports = { getGuideBySlug, getGuides };
