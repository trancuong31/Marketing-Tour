const { Notification } = require('../models');
const { catchAsync } = require('../utils/catchAsync');

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parsePositiveInteger = (value, fallback) => {
    const parsedValue = Number.parseInt(value, 10);
    return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
};

const getMyNotifications = catchAsync(async (req, res) => {
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = Math.min(parsePositiveInteger(req.query.limit, DEFAULT_LIMIT), MAX_LIMIT);
    const offset = (page - 1) * limit;

    const { count, rows: notifications } = await Notification.findAndCountAll({
        where: { user_id: req.user.id },
        order: [['created_at', 'DESC']],
        limit,
        offset,
    });

    const unreadCount = await Notification.count({
        where: { user_id: req.user.id, is_read: 0 },
    });

    res.status(200).json({
        status: 'success',
        unreadCount,
        pagination: {
            currentPage: page,
            totalPages: Math.max(1, Math.ceil(count / limit)),
            totalItems: count,
            limit,
        },
        data: notifications,
    });
});

const markAllAsRead = catchAsync(async (req, res) => {
    await Notification.update(
        { is_read: 1 },
        { where: { user_id: req.user.id, is_read: 0 } },
    );

    res.status(200).json({
        status: 'success',
        message: 'All notifications marked as read',
    });
});

const markOneAsRead = catchAsync(async (req, res) => {
    const { id } = req.params;

    await Notification.update(
        { is_read: 1 },
        { where: { id, user_id: req.user.id } },
    );

    res.status(200).json({
        status: 'success',
        message: 'Notification marked as read',
    });
});

module.exports = {
    getMyNotifications,
    markAllAsRead,
    markOneAsRead,
};
