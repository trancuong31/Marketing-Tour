const { catchAsync } = require('../utils/catchAsync');
const { translateTexts } = require('../services/translationService');
const { assertVietnameseSourceFields } = require('../utils/tourLocaleContent');
const { normalizeTargetLanguage } = require('../utils/language');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');

/**
 * Translate Vietnamese admin content to the requested language.
 * POST /api/admin/translate
 * Body: { texts: { title: "...", summary: "..." }, targetLang: "en" }
 */
const translateContent = catchAsync(async (req, res) => {
    const targetLanguage = normalizeTargetLanguage(req.body?.targetLang);
    if (!targetLanguage || targetLanguage === 'vi') {
        throw new AppError('Ngôn ngữ đích phải là en hoặc zh', HTTP_CODES.BAD_REQUEST);
    }

    const { texts } = req.body || {};
    if (!texts || typeof texts !== 'object' || Array.isArray(texts) || Object.keys(texts).length === 0) {
        throw new AppError('Dữ liệu văn bản không hợp lệ', HTTP_CODES.BAD_REQUEST);
    }
    try {
        assertVietnameseSourceFields(texts, { requiredFields: Object.keys(texts) });
    } catch (error) {
        const validationError = new AppError(error.message, HTTP_CODES.BAD_REQUEST);
        validationError.fields = error.fields;
        throw validationError;
    }

    const translatedTexts = await translateTexts({
        texts,
        targetLang: targetLanguage,
        strict: true,
    });

    res.status(200).json({
        status: 'success',
        data: translatedTexts,
    });
});

module.exports = {
    translateContent,
};
