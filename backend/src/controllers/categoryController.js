const { Category } = require('../models');
const { catchAsync } = require('../utils/catchAsync');

/**
 * Lấy danh sách tất cả danh mục tour
 * GET /api/categories
 */
const getCategories = catchAsync(async (req, res) => {
    const categories = await Category.findAll({
        order: [['name', 'ASC']],
    });

    res.status(200).json({
        status: 'success',
        results: categories.length,
        data: categories,
    });
});

module.exports = { getCategories };
