const { catchAsync } = require('../utils/catchAsync');
const { translateTexts } = require('../services/translationService');

/**
 * Translate Vietnamese admin content to the requested language.
 * POST /api/admin/translate
 * Body: { texts: { title: "...", summary: "..." }, targetLang: "en" }
 */
const translateContent = catchAsync(async (req, res) => {
    const translatedTexts = await translateTexts(req.body);

    res.status(200).json({
        status: 'success',
        data: translatedTexts,
    });
});

module.exports = {
    translateContent,
};
