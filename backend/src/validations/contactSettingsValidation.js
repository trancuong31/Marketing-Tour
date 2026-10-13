const Joi = require('joi');
const { CONTACT_TYPES } = require('../constants/contactSettings');

const LOCALES = ['vi', 'en', 'zh'];
const CONTACT_IDS = Object.keys(CONTACT_TYPES);
const ICONS = ['phone', 'mail', 'facebook', 'zalo', 'wechat'];
const localeText = (max = 120, allowEmpty = false) => Joi.object(
    Object.fromEntries(LOCALES.map((locale) => {
        const field = Joi.string().trim().max(max);
        return [locale, (allowEmpty ? field.allow('') : field).required()];
    })),
).required();

const validPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    return /^[+\d(). -]+$/.test(value) && digits.length >= 6 && digits.length <= 15;
};

const parseHttpsUrl = (value) => {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' && !url.username && !url.password ? url : null;
    } catch {
        return null;
    }
};

const hostMatches = (hostname, allowedHost) => (
    hostname === allowedHost || hostname.endsWith(`.${allowedHost}`)
);

const validateSocialDestination = (contact) => {
    if (!contact.destination) return true;
    const url = parseHttpsUrl(contact.destination);
    if (!url) return false;

    const allowedHosts = {
        facebook: ['facebook.com', 'fb.com', 'fb.me'],
        zalo: ['zalo.me'],
        wechat: ['wechat.com', 'weixin.qq.com'],
    }[contact.type] || [];

    return allowedHosts.some((host) => hostMatches(url.hostname.toLowerCase(), host));
};

const contactSchema = Joi.object({
    id: Joi.string().valid(...CONTACT_IDS).required(),
    type: Joi.string().valid('phone', 'email', 'facebook', 'zalo', 'wechat').required(),
    labels: localeText(80),
    displayValue: Joi.string().trim().max(180).allow('').required(),
    destination: Joi.string().trim().max(500).allow('').required(),
    phoneNumber: Joi.string().trim().max(32).allow('').required(),
    accountIdentifier: Joi.string().trim().max(120).allow('').required(),
    icon: Joi.string().valid(...ICONS).required(),
    enabled: Joi.boolean().required(),
    footerVisible: Joi.boolean().required(),
    floatingVisible: Joi.boolean().required(),
    footerOrder: Joi.number().integer().min(1).max(100).required(),
    floatingOrder: Joi.number().integer().min(1).max(100).required(),
    wechatAction: Joi.string().valid('none', 'url', 'copy').required(),
}).unknown(false).custom((contact, helpers) => {
    if (CONTACT_TYPES[contact.id] !== contact.type) return helpers.error('any.invalid');

    if (contact.phoneNumber && !validPhone(contact.phoneNumber)) return helpers.error('any.invalid');

    if (contact.destination && contact.type === 'phone' && !validPhone(contact.destination)) {
        return helpers.error('any.invalid');
    }

    if (contact.type === 'phone' && contact.enabled && !contact.destination) {
        return helpers.error('any.invalid');
    }

    if (contact.type === 'email' && contact.displayValue && Joi.string().email().validate(contact.displayValue).error) {
        return helpers.error('any.invalid');
    }

    if (contact.type === 'email' && contact.enabled && !contact.displayValue) {
        return helpers.error('any.invalid');
    }

    if (['facebook', 'zalo', 'wechat'].includes(contact.type) && !validateSocialDestination(contact)) {
        return helpers.error('any.invalid');
    }

    if (contact.type === 'wechat') {
        if (contact.wechatAction === 'url' && !contact.destination) return helpers.error('any.invalid');
        if (contact.wechatAction === 'copy' && !contact.accountIdentifier) return helpers.error('any.invalid');
    } else if (contact.wechatAction !== 'none') {
        return helpers.error('any.invalid');
    }

    return contact;
}).messages({ 'any.invalid': 'Invalid contact method settings.' });

const contactSettingsSchema = Joi.object({
    general: Joi.object({
        heading: localeText(100),
        workingHours: localeText(100),
        description: localeText(280, true),
    }).unknown(false).required(),
    contacts: Joi.array().items(contactSchema).length(CONTACT_IDS.length).unique('id').required(),
}).unknown(false).custom((settings, helpers) => {
    const actualIds = new Set(settings.contacts.map((contact) => contact.id));
    if (CONTACT_IDS.some((contactId) => !actualIds.has(contactId))) return helpers.error('any.invalid');

    for (const placement of ['footer', 'floating']) {
        const orderKey = `${placement}Order`;
        const visibleOrders = settings.contacts
            .filter((contact) => contact.enabled && contact[`${placement}Visible`])
            .map((contact) => contact[orderKey]);
        if (new Set(visibleOrders).size !== visibleOrders.length) return helpers.error('any.invalid');
    }

    return settings;
}).messages({ 'any.invalid': 'Each contact must have a unique identifier and display order.' });

module.exports = { contactSettingsSchema, validPhone, parseHttpsUrl };