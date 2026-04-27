const authService = require('../services/authService');
const { catchAsync } = require('../utils/catchAsync');
const { HTTP_CODES } = require('../constants/httpCodes');
const env = require('../config/env');

/**
 * Cookie options for refresh token
 */
const getRefreshCookieOptions = () => ({
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'strict' : 'lax',
    path: '/api/auth',
    maxAge: env.jwt.refreshCookieMaxAge * 24 * 60 * 60 * 1000, // days → ms
});

/**
 * Set refresh token as HttpOnly cookie and return access token in body
 */
const sendTokenResponse = (res, statusCode, message, result) => {
    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

    // Return access token + user in response body (FE stores in memory)
    res.status(statusCode).json({
        status: 'success',
        message,
        data: {
            user: result.user,
            accessToken: result.accessToken,
        },
    });
};

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

    sendTokenResponse(res, HTTP_CODES.OK, 'Xác thực email thành công. Tài khoản đã được kích hoạt.', result);
});

/**
 * Login user
 */
const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    sendTokenResponse(res, HTTP_CODES.OK, 'Đăng nhập thành công', result);
});

/**
 * Refresh access token using refresh token from cookie
 */
const refresh = catchAsync(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(HTTP_CODES.UNAUTHORIZED).json({
            status: 'fail',
            message: 'Không tìm thấy refresh token',
        });
    }

    const result = await authService.refreshAccessToken(refreshToken);

    sendTokenResponse(res, HTTP_CODES.OK, 'Làm mới token thành công', result);
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
 * Logout user — clear refresh token cookie
 */
const logout = catchAsync(async (req, res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        sameSite: env.nodeEnv === 'production' ? 'strict' : 'lax',
        path: '/api/auth',
    });

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        message: 'Đăng xuất thành công',
    });
});

/**
 * Refresh Access Token
 */
const refreshToken = catchAsync(async (req, res) => {
    const { refreshToken: token } = req.body;
    const result = await authService.refreshAccessToken(token);

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: result,
    });
});

module.exports = {
    register,
    verifyEmail,
    login,
    refresh,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    resendOtp,
    getMe,
    logout,
    refreshToken,
};
