const { authenticate, authorize } = require('./auth');
const { errorHandler } = require('./errorHandler');
const { validate } = require('./validate');
const { apiLimiter, authLimiter, bookingLimiter } = require('./rateLimiter');
const detectLanguage = require('./detectLanguage');

module.exports = {
    authenticate,
    authorize,
    errorHandler,
    validate,
    apiLimiter,
    authLimiter,
    bookingLimiter,
    detectLanguage,
};
