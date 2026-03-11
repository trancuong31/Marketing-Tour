/**
 * OTP Configuration Constants
 */
const OTP_CONFIG = {
    LENGTH: 6,
    EXPIRY_MINUTES: 5,
    MAX_ATTEMPTS: 5,
    MAX_SENDS_PER_WINDOW: 3,
    SEND_WINDOW_MINUTES: 10,
};

/**
 * OTP Types
 */
const OTP_TYPES = {
    REGISTER: 'register',
    RESET_PASSWORD: 'reset_password',
};

module.exports = { OTP_CONFIG, OTP_TYPES };
