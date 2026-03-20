const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');
const { OTP_TYPES } = require('../constants/otp');
const env = require('../config/env');
const otpService = require('./otpService');

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, env.jwt.secret, {
        expiresIn: env.jwt.expiresIn,
    });
};

/**
 * Generate short-lived reset token (10 minutes)
 */
const generateResetToken = (userId) => {
    return jwt.sign({ id: userId, purpose: 'reset_password' }, env.jwt.secret, {
        expiresIn: '10m',
    });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
    return jwt.verify(token, env.jwt.secret);
};

/**
 * Format user object for API response (remove sensitive fields)
 */
const formatUserResponse = (user) => {
    const userData = user.toJSON ? user.toJSON() : { ...user };
    delete userData.password;
    return userData;
};

/**
 * Register a new user (creates inactive account + sends OTP)
 */
const register = async (userData) => {
    const { full_name, email, password, phone_number } = userData;

    // Check email uniqueness
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
        throw new AppError('Email đã được sử dụng', HTTP_CODES.CONFLICT);
    }

    // Check phone uniqueness
    if (phone_number) {
        const existingPhone = await User.findOne({ where: { phone_number } });
        if (existingPhone) {
            throw new AppError('Số điện thoại đã được sử dụng', HTTP_CODES.CONFLICT);
        }
    }

    // Hash password
    // const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (inactive)
    const user = await User.create({
        full_name,
        email,
        password: password,
        phone_number: phone_number || null,
        role_id: 2, // default user role
        is_active: 0,
    });

    // Generate and send OTP
    await otpService.generateAndSendOtp(email, OTP_TYPES.REGISTER);

    return { user: formatUserResponse(user) };
};

/**
 * Verify email with OTP (activates account)
 */
const verifyEmail = async (email, otpCode) => {
    // Verify OTP
    await otpService.verifyOtp(email, otpCode, OTP_TYPES.REGISTER);

    // Find and activate user
    const user = await User.findOne({
        where: { email },
        include: [{ model: Role, attributes: ['role_name'] }],
    });

    if (!user) {
        throw new AppError('Tài khoản không tồn tại', HTTP_CODES.NOT_FOUND);
    }

    if (user.is_active === 1) {
        throw new AppError('Tài khoản đã được kích hoạt', HTTP_CODES.BAD_REQUEST);
    }

    // Activate account
    await user.update({
        is_active: 1,
        updated_at: new Date(),
    });

    // Generate token
    const token = generateToken(user.id);

    return { user: formatUserResponse(user), token };
};

/**
 * Login user
 */
const login = async (email, password) => {
    // Find user with role
    const user = await User.findOne({
        where: { email },
        include: [{ model: Role, attributes: ['role_name'] }],
    });

    if (!user) {
        throw new AppError('Email hoặc mật khẩu không đúng', HTTP_CODES.UNAUTHORIZED);
    }

    // Check if account is activated
    if (user.is_active === 0) {
        throw new AppError(
            'Tài khoản chưa được xác thực email. Vui lòng kiểm tra email để nhập mã OTP.',
            HTTP_CODES.FORBIDDEN
        );
    }

    // Compare password
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    if (password !== user.password) {
        throw new AppError('Email hoặc mật khẩu không đúng', HTTP_CODES.UNAUTHORIZED);
    }

    // Update last login
    await user.update({
        last_login: new Date(),
        updated_at: new Date(),
    });

    // Generate token
    const token = generateToken(user.id);

    return { user: formatUserResponse(user), token };
};

/**
 * Forgot password — send OTP to email
 */
const forgotPassword = async (email) => {
    const user = await User.findOne({ where: { email } });

    if (!user) {
        throw new AppError('Email không tồn tại trong hệ thống', HTTP_CODES.NOT_FOUND);
    }

    // Generate and send OTP
    await otpService.generateAndSendOtp(email, OTP_TYPES.RESET_PASSWORD);

    return { message: 'Mã OTP đã được gửi đến email của bạn' };
};

/**
 * Verify reset password OTP — returns temporary reset token
 */
const verifyResetOtp = async (email, otpCode) => {
    await otpService.verifyOtp(email, otpCode, OTP_TYPES.RESET_PASSWORD);

    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new AppError('Tài khoản không tồn tại', HTTP_CODES.NOT_FOUND);
    }

    // Generate short-lived reset token
    const resetToken = generateResetToken(user.id);

    return { resetToken };
};

/**
 * Reset password using reset token
 */
const resetPassword = async (resetToken, password) => {
    let decoded;
    try {
        decoded = verifyToken(resetToken);
    } catch {
        throw new AppError('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn', HTTP_CODES.BAD_REQUEST);
    }

    if (decoded.purpose !== 'reset_password') {
        throw new AppError('Token không hợp lệ', HTTP_CODES.BAD_REQUEST);
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
        throw new AppError('Tài khoản không tồn tại', HTTP_CODES.NOT_FOUND);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password
    await user.update({
        password: hashedPassword,
        updated_at: new Date(),
    });

    return { message: 'Đặt lại mật khẩu thành công' };
};

/**
 * Resend OTP
 */
const resendOtp = async (email, type) => {
    // For register type, check user exists and is inactive
    if (type === OTP_TYPES.REGISTER) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new AppError('Tài khoản không tồn tại', HTTP_CODES.NOT_FOUND);
        }
        if (user.is_active === 1) {
            throw new AppError('Tài khoản đã được kích hoạt', HTTP_CODES.BAD_REQUEST);
        }
    }

    // For reset_password, check user exists
    if (type === OTP_TYPES.RESET_PASSWORD) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new AppError('Email không tồn tại trong hệ thống', HTTP_CODES.NOT_FOUND);
        }
    }

    await otpService.generateAndSendOtp(email, type);

    return { message: 'Mã OTP mới đã được gửi' };
};

module.exports = {
    register,
    verifyEmail,
    login,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    resendOtp,
    generateToken,
    verifyToken,
};
