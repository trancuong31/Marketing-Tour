const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');
const { OTP_TYPES } = require('../constants/otp');
const env = require('../config/env');
const otpService = require('./otpService');
const { normalizeLanguage } = require('../utils/language');

/**
 * Generate JWT token
 */
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            role_id: user.role_id,
        },
        env.jwt.secret,
        { expiresIn: env.jwt.expiresIn }
    );
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            role_id: user.role_id,
        },
        env.jwt.refreshSecret,
        { expiresIn: env.jwt.refreshExpiresIn || '7d' }
    );
};

/**
 * Generate reset token (10 minutes)
 */
const generateResetToken = (userId) => {
    return jwt.sign(
        { id: userId, purpose: 'reset_password' },
        env.jwt.secret,
        { expiresIn: '10m' }
    );
};

/**
 * Verify access token
 */
const verifyToken = (token) => {
    return jwt.verify(token, env.jwt.secret);
};

/**
 * Remove sensitive fields
 */
const formatUserResponse = (user) => {
    const data = user.toJSON ? user.toJSON() : { ...user };
    delete data.password;

    data.role_id = user.role_id;

    return data;
};
/**
 * REGISTER
 */
const register = async (userData, language = 'vi') => {
    const { full_name, email, password, phone_number } = userData;
    const preferredLanguage = normalizeLanguage(language || userData.language);

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
        throw new AppError('Email đã được sử dụng', HTTP_CODES.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
        full_name,
        email,
        password: hashedPassword,
        phone_number: phone_number || null,
        role_id: 2,
        is_active: 0,
        language: preferredLanguage,
    });

    await otpService.generateAndSendOtp(email, OTP_TYPES.REGISTER, preferredLanguage);

    return { user: formatUserResponse(user) };
};

/**
 * VERIFY EMAIL (OTP)
 */
const verifyEmail = async (email, otpCode) => {
    await otpService.verifyOtp(email, otpCode, OTP_TYPES.REGISTER);

    const user = await User.findOne({
        where: { email },
        include: [{ model: Role, attributes: ['role_name'] }],
    });

    if (!user) {
        throw new AppError('Tài khoản không tồn tại', HTTP_CODES.NOT_FOUND);
    }

    if (user.is_active === 1) {
        throw new AppError('Tài khoản đã kích hoạt', HTTP_CODES.BAD_REQUEST);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await user.update({
        is_active: 1,
    });

    return { user: formatUserResponse(user), accessToken, refreshToken };
};

/**
 * LOGIN
 */
const login = async (email, password) => {
    const user = await User.findOne({
        where: { email },
        include: [{ model: Role, attributes: ['role_name'] }],
    });

    if (!user) {
        throw new AppError('Email hoặc mật khẩu không đúng', HTTP_CODES.UNAUTHORIZED);
    }

    if (user.is_active === 0) {
        throw new AppError('Tài khoản chưa xác thực email', HTTP_CODES.FORBIDDEN);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new AppError('Email hoặc mật khẩu không đúng', HTTP_CODES.UNAUTHORIZED);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await user.update({
        last_login: new Date(),
    });

    return { user: formatUserResponse(user), accessToken, refreshToken };
};

/**
 * FORGOT PASSWORD
 */
const forgotPassword = async (email, language = 'vi') => {
    const user = await User.findOne({ where: { email } });

    if (!user) {
        throw new AppError('Email không tồn tại', HTTP_CODES.NOT_FOUND);
    }

    await otpService.generateAndSendOtp(email, OTP_TYPES.RESET_PASSWORD, language || user.language);

    return { message: 'OTP đã gửi về email' };
};

/**
 * VERIFY RESET OTP
 */
const verifyResetOtp = async (email, otpCode) => {
    await otpService.verifyOtp(email, otpCode, OTP_TYPES.RESET_PASSWORD);

    const user = await User.findOne({ where: { email } });

    if (!user) {
        throw new AppError('Tài khoản không tồn tại', HTTP_CODES.NOT_FOUND);
    }

    const resetToken = generateResetToken(user.id);

    return { resetToken };
};

/**
 * RESET PASSWORD
 */
const resetPassword = async (resetToken, password) => {
    let decoded;

    try {
        decoded = verifyToken(resetToken);
    } catch {
        throw new AppError('Token không hợp lệ hoặc hết hạn', HTTP_CODES.BAD_REQUEST);
    }

    if (decoded.purpose !== 'reset_password') {
        throw new AppError('Token không hợp lệ', HTTP_CODES.BAD_REQUEST);
    }

    const user = await User.findByPk(decoded.id);

    if (!user) {
        throw new AppError('Tài khoản không tồn tại', HTTP_CODES.NOT_FOUND);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await user.update({
        password: hashedPassword,
    });

    return { message: 'Đổi mật khẩu thành công' };
};

/**
 * RESEND OTP
 */
const resendOtp = async (email, type, language = 'vi') => {
    const user = await User.findOne({ where: { email } });

    if (!user) {
        throw new AppError('Tài khoản không tồn tại', HTTP_CODES.NOT_FOUND);
    }

    if (type === OTP_TYPES.REGISTER && user.is_active === 1) {
        throw new AppError('Tài khoản đã kích hoạt', HTTP_CODES.BAD_REQUEST);
    }

    await otpService.generateAndSendOtp(email, type, language || user.language);

    return { message: 'OTP mới đã được gửi' };
};

/**
 * REFRESH ACCESS TOKEN
 */
const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new AppError('Refresh token không tồn tại', HTTP_CODES.UNAUTHORIZED);
    }

    let decoded;
    try {
        decoded = jwt.verify(refreshToken, env.jwt.refreshSecret);
    } catch (err) {
        throw new AppError('Refresh token không hợp lệ hoặc đã hết hạn', HTTP_CODES.UNAUTHORIZED);
    }

    const user = await User.findOne({
        where: { id: decoded.id, is_active: 1 },
        include: [{ model: Role, attributes: ['role_name'] }],
    });

    if (!user) {
        throw new AppError('Tài khoản không tồn tại hoặc đã bị khóa', HTTP_CODES.UNAUTHORIZED);
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    return { user: formatUserResponse(user), accessToken: newAccessToken, refreshToken: newRefreshToken };
};

module.exports = {
    register,
    verifyEmail,
    login,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    resendOtp,
    generateAccessToken,
    generateRefreshToken,
    refreshAccessToken,
    verifyToken,
};
