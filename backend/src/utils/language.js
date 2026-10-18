const SUPPORTED_LANGUAGES = new Set(['vi', 'en', 'zh']);
const DEFAULT_LANGUAGE = 'vi';

const normalizeLanguage = (language) => {
    if (!language || typeof language !== 'string') return DEFAULT_LANGUAGE;

    const normalized = language.trim().toLowerCase();
    if (normalized.startsWith('en')) return 'en';
    if (normalized.startsWith('zh')) return 'zh';
    if (normalized.startsWith('vi')) return 'vi';

    return DEFAULT_LANGUAGE;
};

const normalizeTargetLanguage = (language) => {
    if (!language || typeof language !== 'string') return null;

    const prefix = language.trim().toLowerCase().split(/[-_]/, 1)[0];
    return SUPPORTED_LANGUAGES.has(prefix) ? prefix : null;
};

const isSupportedLanguage = (language) => normalizeTargetLanguage(language) !== null;

module.exports = {
    DEFAULT_LANGUAGE,
    normalizeLanguage,
    normalizeTargetLanguage,
    isSupportedLanguage,
};
