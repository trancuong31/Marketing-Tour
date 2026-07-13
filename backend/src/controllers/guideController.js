const { Guide, GuideTranslation } = require('../models');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');

const getGuideWithTranslation = async ({ slug, language }) => {
    const include = [
        {
            model: GuideTranslation,
            as: 'translations',
            attributes: ['title', 'slug', 'content'],
            where: { language },
            required: false,
        },
    ];

    const guide = await Guide.findOne({
        where: { slug, is_active: 1 },
        include,
    });

    if (guide) return guide;

    const translatedGuide = await Guide.findOne({
        where: { is_active: 1 },
        include: [
            {
                model: GuideTranslation,
                as: 'translations',
                attributes: ['title', 'slug', 'content'],
                where: {
                    language,
                    slug,
                },
                required: true,
            },
        ],
    });

    return translatedGuide;
};

const mapGuideTranslation = (guide) => {
    if (!guide) return null;

    const translation = guide.translations?.[0];

    return {
        id: guide.id,
        title: translation?.title || guide.title,
        slug: translation?.slug || guide.slug,
        content: translation?.content || guide.content,
        is_active: guide.is_active,
        updated_at: guide.updated_at,
    };
};

/**
 * Lấy nội dung hướng dẫn theo slug
 * GET /api/guides/:slug
 */
const getGuideBySlug = catchAsync(async (req, res, next) => {
    const { slug } = req.params;
    const language = req.language || 'vi';

    const guide = await getGuideWithTranslation({ slug, language });

    if (!guide) {
        return next(new AppError('Không tìm thấy bài hướng dẫn', HTTP_CODES.NOT_FOUND));
    }

    res.status(200).json({
        status: 'success',
        data: mapGuideTranslation(guide),
    });
});

/**
 * Lấy danh sách tất cả hướng dẫn (chỉ title, slug)
 * GET /api/guides
 */
const getGuides = catchAsync(async (req, res) => {
    const language = req.language || 'vi';

    const guides = await Guide.findAll({
        where: { is_active: 1 },
        attributes: ['id', 'title', 'slug', 'updated_at'],
        include: [
            {
                model: GuideTranslation,
                as: 'translations',
                attributes: ['title', 'slug'],
                where: { language },
                required: false,
            },
        ],
        order: [['updated_at', 'DESC']],
    });

    const data = guides.map(mapGuideTranslation);

    res.status(200).json({
        status: 'success',
        results: data.length,
        data,
    });
});

module.exports = { getGuideBySlug, getGuides };
