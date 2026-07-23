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

const isSupportedLanguage = (language) => SUPPORTED_LANGUAGES.has(normalizeLanguage(language));

module.exports = {
    DEFAULT_LANGUAGE,
    normalizeLanguage,
    isSupportedLanguage,
};
