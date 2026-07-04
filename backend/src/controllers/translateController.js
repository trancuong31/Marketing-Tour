const { translate } = require('@vitalets/google-translate-api');
const { catchAsync } = require('../utils/catchAsync');

/**
 * API dịch tự động (Sử dụng Google Translate API miễn phí)
 * POST /api/admin/translate
 * Body: { texts: { title: "...", summary: "..." }, targetLang: "en" }
 */
const translateContent = catchAsync(async (req, res) => {
    const { texts, targetLang } = req.body;

    if (!texts || typeof texts !== 'object') {
        return res.status(400).json({ status: 'fail', message: 'Dữ liệu văn bản không hợp lệ' });
    }

    if (!targetLang || !['en', 'zh-CN', 'zh-TW', 'zh'].includes(targetLang)) {
        return res.status(400).json({ status: 'fail', message: 'Ngôn ngữ đích không hợp lệ' });
    }

    const translatedTexts = {};
    const to = targetLang === 'zh' ? 'zh-CN' : targetLang; // google translate uses zh-CN for Chinese Simplified

    // Dịch từng trường văn bản
    for (const [key, value] of Object.entries(texts)) {
        if (!value) {
            translatedTexts[key] = '';
            continue;
        }

        // Tạm thời loại bỏ HTML tags nếu có để dịch không bị lỗi syntax HTML, nhưng NLLB và Google đều hỗ trợ HTML cơ bản.
        // Google Translate API handle được HTML đơn giản.
        try {
            const result = await translate(value, { to });
            translatedTexts[key] = result.text;
        } catch (error) {
            console.error(`Lỗi dịch trường ${key}:`, error);
            translatedTexts[key] = value; // Nếu lỗi, giữ nguyên gốc
        }
    }

    res.status(200).json({
        status: 'success',
        data: translatedTexts
    });
});

module.exports = {
    translateContent
};
