const { normalizeLanguage } = require('../utils/language');

const detectLanguage = (req, res, next) => {
    // 1. Check query param: ?lang=en
    // 2. Check custom header: x-language
    // 3. Default: 'vi'
    
    req.language = normalizeLanguage(req.query.lang || req.headers['x-language']);
    next();
};

module.exports = detectLanguage;
