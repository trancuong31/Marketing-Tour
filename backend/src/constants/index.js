const { HTTP_CODES } = require('./httpCodes');
const { ROLES, isValidRole } = require('./roles');
const { STATUSES, isValidStatus } = require('./statuses');
const { OTP_CONFIG, OTP_TYPES } = require('./otp');

module.exports = {
    HTTP_CODES,
    ROLES,
    isValidRole,
    STATUSES,
    isValidStatus,
    OTP_CONFIG,
    OTP_TYPES,
};

