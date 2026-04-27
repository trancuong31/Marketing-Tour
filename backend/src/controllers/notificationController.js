const { Notification } = require('../models');
const { catchAsync } = require('../utils/catchAsync');
const { HTTP_CODES } = require('../constants/httpCodes');

/**
 * Lấy danh sách thông báo của user hiện tại
 */
const getMyNotifications = catchAsync(async (req, res) => {
    const notifications = await Notification.findAll({
        where: { user_id: req.user.id },
        order: [['created_at', 'DESC']],
        limit: 20
    });

    const unreadCount = await Notification.count({
        where: { user_id: req.user.id, is_read: 0 }
    });

    res.status(200).json({
        status: 'success',
        unreadCount,
        data: notifications,
    });
});

/**
 * Đánh dấu toàn bộ thông báo đã đọc
 */
const markAllAsRead = catchAsync(async (req, res) => {
    await Notification.update(
        { is_read: 1 },
        { where: { user_id: req.user.id, is_read: 0 } }
    );

    res.status(200).json({
        status: 'success',
        message: 'Đã đánh dấu tất cả là đã đọc'
    });
});

/**
 * Đánh dấu 1 thông báo đã đọc
 */
const markOneAsRead = catchAsync(async (req, res) => {
    const { id } = req.params;
    await Notification.update(
        { is_read: 1 },
        { where: { id, user_id: req.user.id } }
    );

    res.status(200).json({
        status: 'success',
        message: 'Đã đánh dấu là đã đọc'
    });
});

module.exports = {
    getMyNotifications,
    markAllAsRead,
    markOneAsRead
};
