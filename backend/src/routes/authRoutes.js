const express = require('express');
const authController = require('../controllers/authController');
const { validate, authenticate } = require('../middlewares');
const { authValidation } = require('../validations');
const { otpLimiter, authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// ── Public routes ──
router.post('/register', authLimiter, validate(authValidation.register), authController.register);
router.post('/verify-email', otpLimiter, validate(authValidation.verifyOtp), authController.verifyEmail);
router.post('/login', authLimiter, validate(authValidation.login), authController.login);
router.post('/forgot-password', authLimiter, validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/verify-reset-otp', otpLimiter, validate(authValidation.verifyOtp), authController.verifyResetOtp);
router.post('/reset-password', authLimiter, validate(authValidation.resetPassword), authController.resetPassword);
router.post('/resend-otp', otpLimiter, validate(authValidation.resendOtp), authController.resendOtp);

// ── Protected routes ──
router.use(authenticate);
router.get('/me', authController.getMe);
router.post('/logout', authController.logout);

module.exports = router;
