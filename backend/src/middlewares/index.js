const { authenticate, authorize } = require('./auth');
const { errorHandler } = require('./errorHandler');
const { validate } = require('./validate');
const { apiLimiter, authLimiter } = require('./rateLimiter');
const detectLanguage = require('./detectLanguage');

module.exports = {
    authenticate,
    authorize,
    errorHandler,
    validate,
    apiLimiter,
    authLimiter,
    detectLanguage,
};
