const { Op } = require('sequelize');
const { UiTranslation } = require('../models');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');
const { normalizeLanguage } = require('../utils/language');

const TRANSLATION_KEY_PATTERN = /^[a-zA-Z0-9_.-]{2,160}$/;
const MAX_TEXT_LENGTH = 5000;
const EDITABLE_FIELDS = ['translation_key', 'description', 'vi', 'en', 'zh'];

const normalizeText = (value) => {
    if (value === undefined || value === null) return null;
    if (typeof value !== 'string') {
        throw new AppError('Translation value must be a string', HTTP_CODES.BAD_REQUEST);
    }
    if (value.length > MAX_TEXT_LENGTH) {
        throw new AppError(`Translation value cannot exceed ${MAX_TEXT_LENGTH} characters`, HTTP_CODES.BAD_REQUEST);
    }
    return value;
};

const validateTranslationKey = (key) => {
    if (!key || typeof key !== 'string' || !TRANSLATION_KEY_PATTERN.test(key.trim())) {
        throw new AppError('Translation key is invalid', HTTP_CODES.BAD_REQUEST);
    }
    return key.trim();
};

const pickTranslationPayload = (body) => {
    const payload = {};

    EDITABLE_FIELDS.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
            payload[field] = field === 'translation_key'
                ? validateTranslationKey(body[field])
                : normalizeText(body[field]);
        }
    });

    if (Object.keys(payload).length === 0) {
        throw new AppError('No translation data provided', HTTP_CODES.BAD_REQUEST);
    }

    return payload;
};

const assignNestedValue = (target, dottedKey, value) => {
    const segments = dottedKey.split('.').filter(Boolean);
    if (segments.length === 0) return;

    let cursor = target;
    segments.forEach((segment, index) => {
        if (index === segments.length - 1) {
            cursor[segment] = value;
            return;
        }

        cursor[segment] = cursor[segment] || {};
        cursor = cursor[segment];
    });
};

const getPublicTranslations = async (language) => {
    const lang = normalizeLanguage(language);
    const attributes = lang === 'vi' ? ['translation_key', 'vi'] : ['translation_key', lang];
    const rows = await UiTranslation.findAll({
        attributes,
        order: [['translation_key', 'ASC']],
    });

    return rows.reduce((resources, row) => {
        const record = row.get({ plain: true });
        const value = record[lang];
        if (!value) return resources;

        assignNestedValue(resources, record.translation_key, value);
        return resources;
    }, {});
};

const getAdminTranslations = async ({ page = 1, limit = 50, search = '' }) => {
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const offset = (safePage - 1) * safeLimit;
    const keyword = typeof search === 'string' ? search.trim() : '';

    const where = keyword
        ? {
            [Op.or]: [
                { translation_key: { [Op.like]: `%${keyword}%` } },
                { description: { [Op.like]: `%${keyword}%` } },
                { vi: { [Op.like]: `%${keyword}%` } },
                { en: { [Op.like]: `%${keyword}%` } },
                { zh: { [Op.like]: `%${keyword}%` } },
            ],
        }
        : undefined;

    const { rows, count } = await UiTranslation.findAndCountAll({
        where,
        order: [['translation_key', 'ASC']],
        limit: safeLimit,
        offset,
    });

    return {
        items: rows,
        pagination: {
            page: safePage,
            limit: safeLimit,
            totalItems: count,
            totalPages: Math.ceil(count / safeLimit) || 1,
        },
    };
};

const createTranslation = async (body) => UiTranslation.create(pickTranslationPayload(body));

const updateTranslation = async (id, body) => {
    const translation = await UiTranslation.findByPk(id);
    if (!translation) {
        throw new AppError('Translation not found', HTTP_CODES.NOT_FOUND);
    }

    await translation.update(pickTranslationPayload(body));
    return translation;
};

const deleteTranslation = async (id) => {
    const deletedCount = await UiTranslation.destroy({ where: { id } });
    if (!deletedCount) {
        throw new AppError('Translation not found', HTTP_CODES.NOT_FOUND);
    }
};

module.exports = {
    getPublicTranslations,
    getAdminTranslations,
    createTranslation,
    updateTranslation,
    deleteTranslation,
};
