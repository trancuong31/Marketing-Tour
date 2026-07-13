const rateLimit = require('express-rate-limit');
const env = require('../config/env');

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.max,
    message: {
        status: 'fail',
        message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict rate limiter for authentication routes
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 20 requests per window
    message: {
        status: 'fail',
        message: 'Quá nhiều lần thử đăng nhập, vui lòng thử lại sau 15 phút.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * OTP rate limiter — stricter for OTP-related routes
 */
const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5, // 5 requests per 10 minutes
    message: {
        status: 'fail',
        message: 'Quá nhiều yêu cầu OTP, vui lòng thử lại sau 10 phút.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    apiLimiter,
    authLimiter,
    otpLimiter,
};
