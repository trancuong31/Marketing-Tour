const authService = require('../services/authService');
const { catchAsync } = require('../utils/catchAsync');
const { HTTP_CODES } = require('../constants/httpCodes');

/**
 * Register a new user
 */
const register = catchAsync(async (req, res) => {
    const result = await authService.register(req.body);

    res.status(HTTP_CODES.CREATED).json({
        status: 'success',
        message: 'Đăng ký thành công. Vui lòng kiểm tra email để nhập mã OTP.',
        data: result,
    });
});

/**
 * Verify email with OTP
 */
const verifyEmail = catchAsync(async (req, res) => {
    const { email, otp_code } = req.body;
    const result = await authService.verifyEmail(email, otp_code);

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        message: 'Xác thực email thành công. Tài khoản đã được kích hoạt.',
        data: result,
    });
});

/**
 * Login user
 */
const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        message: 'Đăng nhập thành công',
        data: result,
    });
});

/**
 * Forgot password — send OTP
 */
const forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        message: result.message,
    });
});

/**
 * Verify reset password OTP
 */
const verifyResetOtp = catchAsync(async (req, res) => {
    const { email, otp_code } = req.body;
    const result = await authService.verifyResetOtp(email, otp_code);

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        message: 'Xác thực OTP thành công',
        data: result,
    });
});

/**
 * Reset password
 */
const resetPassword = catchAsync(async (req, res) => {
    const { reset_token, password } = req.body;
    const result = await authService.resetPassword(reset_token, password);

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        message: result.message,
    });
});

/**
 * Resend OTP
 */
const resendOtp = catchAsync(async (req, res) => {
    const { email, type } = req.body;
    const result = await authService.resendOtp(email, type);

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        message: result.message,
    });
});

/**
 * Get current user profile
 */
const getMe = catchAsync(async (req, res) => {
    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: { user: req.user },
    });
});

/**
 * Logout user
 */
const logout = catchAsync(async (req, res) => {
    res.status(HTTP_CODES.OK).json({
        status: 'success',
        message: 'Đăng xuất thành công',
    });
});

module.exports = {
    register,
    verifyEmail,
    login,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    resendOtp,
    getMe,
    logout,
};
