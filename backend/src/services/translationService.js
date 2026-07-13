const { translate } = require('@vitalets/google-translate-api');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');
const logger = require('../config/logger');

const SUPPORTED_LANGUAGES = new Map([
    ['vi', 'vi'],
    ['en', 'en'],
    ['zh', 'zh-CN'],
    ['zh-CN', 'zh-CN'],
]);

const MAX_FIELDS = 80;
const MAX_FIELD_LENGTH = 12000;
const TRANSLATION_CONCURRENCY = 5;
const FIELD_NAME_PATTERN = /^[a-zA-Z0-9_.-]+$/;

const normalizeTargetLanguage = (language) => {
    if (!language || typeof language !== 'string') return null;
    return SUPPORTED_LANGUAGES.get(language.trim()) || null;
};

const validateTexts = (texts) => {
    if (!texts || Array.isArray(texts) || typeof texts !== 'object') {
        throw new AppError('Dữ liệu văn bản không hợp lệ', HTTP_CODES.BAD_REQUEST);
    }

    const entries = Object.entries(texts);
    if (entries.length === 0 || entries.length > MAX_FIELDS) {
        throw new AppError(`Chỉ được dịch từ 1 đến ${MAX_FIELDS} trường mỗi lần`, HTTP_CODES.BAD_REQUEST);
    }

    return entries.map(([key, value]) => {
        if (!FIELD_NAME_PATTERN.test(key)) {
            throw new AppError('Tên trường dịch không hợp lệ', HTTP_CODES.BAD_REQUEST);
        }

        const text = typeof value === 'string' ? value.trim() : '';
        if (text.length > MAX_FIELD_LENGTH) {
            throw new AppError(`Nội dung trường "${key}" vượt quá giới hạn`, HTTP_CODES.BAD_REQUEST);
        }

        return [key, text];
    });
};

const translateTextEntry = async ([key, value], targetLanguage) => {
    if (!value) return [key, ''];

    try {
        const result = await translate(value, { from: 'vi', to: targetLanguage });
        return [key, result.text];
    } catch (error) {
        logger.warn(`Translate failed for field "${key}": ${error.message}`);
        return [key, value];
    }
};

const translateEntries = async (entries, targetLanguage) => {
    const translatedEntries = [];

    for (let index = 0; index < entries.length; index += TRANSLATION_CONCURRENCY) {
        const chunk = entries.slice(index, index + TRANSLATION_CONCURRENCY);
        const translatedChunk = await Promise.all(
            chunk.map((entry) => translateTextEntry(entry, targetLanguage)),
        );
        translatedEntries.push(...translatedChunk);
    }

    return translatedEntries;
};

const translateTexts = async ({ texts, targetLang }) => {
    const targetLanguage = normalizeTargetLanguage(targetLang);
    if (!targetLanguage) {
        throw new AppError('Ngôn ngữ đích không hợp lệ', HTTP_CODES.BAD_REQUEST);
    }

    const entries = validateTexts(texts);
    if (targetLanguage === 'vi') {
        return Object.fromEntries(entries);
    }

    return Object.fromEntries(await translateEntries(entries, targetLanguage));
};

module.exports = {
    translateTexts,
};
