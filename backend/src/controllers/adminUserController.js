const { Op } = require('sequelize');
const { User, Role, Booking } = require('../models');
const authService = require('../services/authService');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const getRoleName = (role) => String(role?.role_name || '').trim().toLowerCase();
const isAdminRole = (role) => role?.id === 1 || getRoleName(role) === 'admin';

const toSafeUser = (user) => ({
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    phone_number: user.phone_number,
    avatar_url: user.avatar_url,
    role_id: user.role_id,
    role_name: user.Role?.role_name || '',
    is_active: Number(user.is_active) === 1,
    language: user.language,
    last_login: user.last_login,
    created_at: user.created_at,
    updated_at: user.updated_at,
});

const requireAdmin = (req) => {
    if (!isAdminRole(req.user?.Role)) {
        throw new AppError('Bạn không có quyền thực hiện thao tác này', HTTP_CODES.FORBIDDEN);
    }
};

const getPagination = (query) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT));
    return { page, limit, offset: (page - 1) * limit };
};

const buildUserWhere = (query) => {
    const where = {};
    const search = String(query.search || '').trim();

    if (search) {
        where[Op.or] = [
            { full_name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { phone_number: { [Op.like]: `%${search}%` } },
        ];
    }

    if (query.role_id) {
        where.role_id = Number(query.role_id);
    }

    if (query.status === 'active') where.is_active = 1;
    if (query.status === 'locked') where.is_active = 0;

    return where;
};

const getSortOrder = (sort) => {
    if (sort === 'oldest') return [['created_at', 'ASC']];
    if (sort === 'name') return [['full_name', 'ASC']];
    return [['created_at', 'DESC']];
};

const getUserBookingStats = async (userId) => {
    const bookings = await Booking.findAll({
        where: { user_id: userId },
        attributes: ['status', 'total_price'],
        raw: true,
    });

    return bookings.reduce((stats, booking) => {
        const status = booking.status || 'pending';
        stats.total += 1;
        stats.total_spent += Number(booking.total_price || 0);
        if (status === 'approved') stats.approved += 1;
        if (status === 'cancelled') stats.cancelled += 1;
        if (status === 'pending') stats.pending += 1;
        return stats;
    }, {
        total: 0,
        approved: 0,
        cancelled: 0,
        pending: 0,
        total_spent: 0,
    });
};

const ensureUserExists = async (id) => {
    const user = await User.findByPk(id, {
        include: [{ model: Role, attributes: ['id', 'role_name'] }],
        attributes: { exclude: ['password', 'refresh_token'] },
    });

    if (!user) {
        throw new AppError('Không tìm thấy người dùng', HTTP_CODES.NOT_FOUND);
    }

    return user;
};

const ensureCanModifyTarget = async (req, targetUser, nextRole = null) => {
    requireAdmin(req);

    if (Number(req.user.id) === Number(targetUser.id)) {
        throw new AppError('Không thể tự khóa hoặc tự đổi quyền tài khoản của chính mình', HTTP_CODES.BAD_REQUEST);
    }

    const currentRole = await Role.findByPk(targetUser.role_id);
    const currentIsAdmin = isAdminRole(currentRole);
    const nextIsAdmin = nextRole ? isAdminRole(nextRole) : currentIsAdmin;

    if (currentIsAdmin && !nextIsAdmin) {
        const activeAdminCount = await User.count({
            where: { role_id: currentRole.id, is_active: 1 },
        });

        if (activeAdminCount <= 1 && Number(targetUser.is_active) === 1) {
            throw new AppError('Không thể hạ quyền admin cuối cùng', HTTP_CODES.BAD_REQUEST);
        }
    }
};

const listUsers = catchAsync(async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    const where = buildUserWhere(req.query);

    const { rows, count } = await User.findAndCountAll({
        where,
        include: [{ model: Role, attributes: ['id', 'role_name'] }],
        attributes: { exclude: ['password', 'refresh_token'] },
        order: getSortOrder(req.query.sort),
        limit,
        offset,
        distinct: true,
    });

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: rows.map(toSafeUser),
        pagination: {
            page,
            limit,
            totalItems: count,
            totalPages: Math.max(1, Math.ceil(count / limit)),
        },
    });
});

const listRoles = catchAsync(async (_req, res) => {
    const roles = await Role.findAll({ order: [['id', 'ASC']] });
    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: roles,
    });
});

const getUserDetail = catchAsync(async (req, res) => {
    const user = await ensureUserExists(req.params.id);
    const [stats, bookings] = await Promise.all([
        getUserBookingStats(user.id),
        Booking.findAll({
            where: { user_id: user.id },
            attributes: [
                'id', 'booking_code', 'tour_title_snapshot', 'departure_date_snapshot',
                'adult_qty', 'child_qty', 'infant_qty', 'total_price', 'status', 'created_at',
            ],
            order: [['created_at', 'DESC']],
            limit: 20,
        }),
    ]);

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: {
            user: toSafeUser(user),
            stats,
            bookings,
        },
    });
});

const updateUserStatus = catchAsync(async (req, res) => {
    const targetUser = await ensureUserExists(req.params.id);
    await ensureCanModifyTarget(req, targetUser);

    const isActive = Number(req.body.is_active) === 1 ? 1 : 0;

    if (isAdminRole(targetUser.Role) && isActive === 0) {
        const activeAdminCount = await User.count({
            where: { role_id: targetUser.role_id, is_active: 1 },
        });
        if (activeAdminCount <= 1) {
            throw new AppError('Không thể khóa admin cuối cùng', HTTP_CODES.BAD_REQUEST);
        }
    }

    await targetUser.update({ is_active: isActive, updated_at: new Date() });

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: toSafeUser(targetUser),
    });
});

const updateUserRole = catchAsync(async (req, res) => {
    const targetUser = await ensureUserExists(req.params.id);
    const nextRole = await Role.findByPk(req.body.role_id);

    if (!nextRole) {
        throw new AppError('Vai trò không hợp lệ', HTTP_CODES.BAD_REQUEST);
    }

    await ensureCanModifyTarget(req, targetUser, nextRole);
    await targetUser.update({ role_id: nextRole.id, updated_at: new Date() });
    targetUser.Role = nextRole;

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: toSafeUser(targetUser),
    });
});

const sendResetPassword = catchAsync(async (req, res) => {
    requireAdmin(req);
    const targetUser = await ensureUserExists(req.params.id);

    await authService.forgotPassword(targetUser.email, targetUser.language || 'vi');

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        message: 'Đã gửi OTP đặt lại mật khẩu đến email người dùng',
    });
});

module.exports = {
    listUsers,
    listRoles,
    getUserDetail,
    updateUserStatus,
    updateUserRole,
    sendResetPassword,
};
