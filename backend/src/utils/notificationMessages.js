const { normalizeLanguage } = require('./language');

const COPY = {
    vi: {
        system: 'Hệ thống',
        bookingCreated: tourTitle => `bạn đã đặt thành công tour "${tourTitle}". Vui lòng chờ nhân viên liên hệ xác nhận.`,
        bookingApproved: tourTitle => `đơn đặt tour "${tourTitle}" của bạn đã được duyệt`,
    },
    en: {
        system: 'System',
        bookingCreated: tourTitle => `your booking for "${tourTitle}" has been submitted. Please wait for our team to contact you for confirmation.`,
        bookingApproved: tourTitle => `your booking for "${tourTitle}" has been approved`,
    },
    zh: {
        system: '系统',
        bookingCreated: tourTitle => `您已成功提交 "${tourTitle}" 的预订。请等待工作人员联系确认。`,
        bookingApproved: tourTitle => `您预订的 "${tourTitle}" 已通过审核`,
    },
};

const getNotificationCopy = (language) => COPY[normalizeLanguage(language)] || COPY.vi;

module.exports = {
    getNotificationCopy,
};
