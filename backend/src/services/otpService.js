const crypto = require('crypto');
const { Op } = require('sequelize');
const { Otp } = require('../models');
const { AppError } = require('../utils/appError');
const { sendOtpEmail } = require('../utils/email');
const { HTTP_CODES } = require('../constants/httpCodes');
const { OTP_CONFIG } = require('../constants/otp');

/**
 * Generate a random numeric OTP code
 */
const generateOtpCode = () => {
    const min = Math.pow(10, OTP_CONFIG.LENGTH - 1);
    const max = Math.pow(10, OTP_CONFIG.LENGTH) - 1;
    return crypto.randomInt(min, max + 1).toString();
};

/**
 * Check OTP send rate limit (max N sends per window)
 */
const checkSendRateLimit = async (email, type) => {
    const windowStart = new Date(Date.now() - OTP_CONFIG.SEND_WINDOW_MINUTES * 60 * 1000);

    const recentCount = await Otp.count({
        where: {
            email,
            type,
            created_at: { [Op.gte]: windowStart },
        },
    });

    if (recentCount >= OTP_CONFIG.MAX_SENDS_PER_WINDOW) {
        throw new AppError(
            `Bạn đã gửi quá ${OTP_CONFIG.MAX_SENDS_PER_WINDOW} mã OTP trong ${OTP_CONFIG.SEND_WINDOW_MINUTES} phút. Vui lòng thử lại sau.`,
            HTTP_CODES.TOO_MANY_REQUESTS
        );
    }
};

/**
 * Generate and send OTP to email
 */
const generateAndSendOtp = async (email, type, language = 'vi') => {
    // Check rate limit
    await checkSendRateLimit(email, type);

    // Generate OTP code
    const otpCode = generateOtpCode();

    // Calculate expiry time
    const expiredAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);

    // Delete old OTPs for same email + type
    await Otp.destroy({
        where: { email, type },
    });

    // Save new OTP
    await Otp.create({
        email,
        otp_code: otpCode,
        type,
        expired_at: expiredAt,
    });

    // Send OTP email
    await sendOtpEmail(email, otpCode, type, language);

    return { expiredAt };
};

/**
 * Verify OTP code
 */
const verifyOtp = async (email, otpCode, type) => {
    const otp = await Otp.findOne({
        where: { email, type },
        order: [['created_at', 'DESC']],
    });

    if (!otp) {
        throw new AppError('Mã OTP không tồn tại. Vui lòng yêu cầu mã mới.', HTTP_CODES.BAD_REQUEST);
    }

    // Check expiry
    if (new Date() > new Date(otp.expired_at)) {
        await otp.destroy();
        throw new AppError('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.', HTTP_CODES.BAD_REQUEST);
    }

    // Check max attempts
    if (otp.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
        await otp.destroy();
        throw new AppError(
            `Bạn đã nhập sai quá ${OTP_CONFIG.MAX_ATTEMPTS} lần. Vui lòng yêu cầu mã mới.`,
            HTTP_CODES.TOO_MANY_REQUESTS
        );
    }

    // Verify code
    if (otp.otp_code !== otpCode) {
        await otp.update({ attempts: otp.attempts + 1 });
        const remaining = OTP_CONFIG.MAX_ATTEMPTS - otp.attempts - 1;
        throw new AppError(
            `Mã OTP không đúng. Còn ${remaining} lần thử.`,
            HTTP_CODES.BAD_REQUEST
        );
    }

    // OTP is valid — delete it
    await otp.destroy();

    return true;
};

/**
 * Cleanup expired OTP records
 */
const cleanupExpiredOtps = async () => {
    await Otp.destroy({
        where: {
            expired_at: { [Op.lt]: new Date() },
        },
    });
};

module.exports = {
    generateAndSendOtp,
    verifyOtp,
    cleanupExpiredOtps,
};
