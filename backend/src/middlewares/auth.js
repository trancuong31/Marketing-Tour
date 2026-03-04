const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const { HTTP_CODES } = require('../constants/httpCodes');
const env = require('../config/env');

/**
 * Middleware xác thực JWT token
 */
const authenticate = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('Vui lòng đăng nhập để truy cập', HTTP_CODES.UNAUTHORIZED));
    }

    // Verify token
    const decoded = jwt.verify(token, env.jwt.secret);

    // Kiểm tra user còn tồn tại và active
    const user = await User.findOne({
        where: { id: decoded.id, is_active: 1 },
        include: [{ model: Role, attributes: ['role_name'] }],
    });

    if (!user) {
        return next(new AppError('Tài khoản không tồn tại hoặc đã bị khóa', HTTP_CODES.UNAUTHORIZED));
    }

    req.user = user;
    next();
});

/**
 * Middleware phân quyền theo role
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        const userRole = req.user.Role?.role_name;
        if (!roles.includes(userRole)) {
            return next(new AppError('Bạn không có quyền thực hiện hành động này', HTTP_CODES.FORBIDDEN));
        }
        next();
    };
};

module.exports = { authenticate, authorize };
