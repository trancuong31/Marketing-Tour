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

    // 1. Lấy token từ header
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
        // Sử dụng regex \s+ để xử lý trường hợp có nhiều khoảng trắng
        token = authHeader.split(/\s+/)[1];
    }

    // 2. Không có token
    if (!token || token === 'null' || token === 'undefined') {
        return next(new AppError('Vui lòng đăng nhập để truy cập', HTTP_CODES.UNAUTHORIZED));
    }

    // 3. Verify token (bắt lỗi rõ ràng)
    let decoded;
    try {
        decoded = jwt.verify(token, env.jwt.secret);
    } catch (err) {
        return next(new AppError('Token không hợp lệ hoặc đã hết hạn', HTTP_CODES.UNAUTHORIZED));
    }

    // 4. Kiểm tra user
    const user = await User.findOne({
        where: { id: decoded.id, is_active: 1 },
        include: [{ model: Role, attributes: ['role_name'] }],
    });

    if (!user) {
        return next(new AppError('Tài khoản không tồn tại hoặc đã bị khóa', HTTP_CODES.UNAUTHORIZED));
    }

    // 5. Gán user vào request
    req.user = user;

    next();
});

/**
 * Middleware phân quyền theo role
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        const userRole = req.user?.Role?.role_name;

        if (!userRole) {
            return next(new AppError('Không xác định được quyền người dùng', HTTP_CODES.FORBIDDEN));
        }

        if (!roles.includes(userRole)) {
            return next(new AppError('Bạn không có quyền thực hiện hành động này', HTTP_CODES.FORBIDDEN));
        }

        next();
    };
};

/**
 * Middleware xác thực tùy chọn (nếu có token thì gán req.user, nếu không thì bỏ qua)
 */
const optionalAuthenticate = catchAsync(async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
        token = authHeader.split(/\s+/)[1];
    }

    if (!token || token === 'null' || token === 'undefined') {
        return next();
    }

    try {
        const decoded = jwt.verify(token, env.jwt.secret);
        const user = await User.findOne({
            where: { id: decoded.id, is_active: 1 },
            include: [{ model: Role, attributes: ['role_name'] }],
        });
        if (user) req.user = user;
    } catch (err) {
        // Bỏ qua lỗi token nếu dùng optional
    }
    next();
});

module.exports = { authenticate, authorize, optionalAuthenticate };