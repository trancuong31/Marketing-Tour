const detectLanguage = (req, res, next) => {
    // 1. Check query param: ?lang=en
    // 2. Check custom header: x-language
    // 3. Default: 'vi'
    
    let lang = req.query.lang || req.headers['x-language'] || 'vi';
    
    // Simple normalization
    if (lang.startsWith('en')) lang = 'en';
    else if (lang.startsWith('zh')) lang = 'zh';
    else lang = 'vi'; // fallback
    
    req.language = lang;
    next();
};

module.exports = detectLanguage;
