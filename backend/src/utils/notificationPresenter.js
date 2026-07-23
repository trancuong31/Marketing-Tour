const { Op } = require('sequelize');
const { Tour, TourTranslation } = require('../models');
const { normalizeLanguage } = require('./language');

const SYSTEM_SENDER = {
    vi: 'Hệ thống',
    en: 'System',
    zh: '系统',
};

const MESSAGE_COPY = {
    vi: {
        like: tourTitle => `đã thích bình luận của bạn tại tour "${tourTitle}"`,
        reply: tourTitle => `đã phản hồi bình luận của bạn tại tour "${tourTitle}"`,
        bookingCreated: tourTitle => `bạn đã đặt thành công tour "${tourTitle}". Vui lòng chờ nhân viên liên hệ xác nhận.`,
        bookingApproved: tourTitle => `đơn đặt tour "${tourTitle}" của bạn đã được duyệt`,
    },
    en: {
        like: tourTitle => `liked your comment on tour "${tourTitle}"`,
        reply: tourTitle => `replied to your comment on tour "${tourTitle}"`,
        bookingCreated: tourTitle => `your booking for "${tourTitle}" has been submitted. Please wait for our team to contact you for confirmation.`,
        bookingApproved: tourTitle => `your booking for "${tourTitle}" has been approved`,
    },
    zh: {
        like: tourTitle => `点赞了您在 "${tourTitle}" 旅游中的评论`,
        reply: tourTitle => `回复了您在 "${tourTitle}" 旅游中的评论`,
        bookingCreated: tourTitle => `您已成功提交 "${tourTitle}" 的预订。请等待工作人员联系确认。`,
        bookingApproved: tourTitle => `您预订的 "${tourTitle}" 已通过审核`,
    },
};

const extractQuotedText = (message = '') => {
    const match = String(message).match(/"([^"]+)"/);
    return match?.[1] || '';
};

const getLocalizedTourTitles = async ({ slugs, language }) => {
    const uniqueSlugs = [...new Set(slugs.filter(Boolean))];
    if (uniqueSlugs.length === 0) return {};

    const tours = await Tour.findAll({
        where: { slug: { [Op.in]: uniqueSlugs } },
        attributes: ['id', 'title', 'slug'],
        include: [
            {
                model: TourTranslation,
                as: 'translations',
                where: { language },
                attributes: ['title'],
                required: false,
            },
        ],
    });

    return tours.reduce((titles, tour) => {
        const plainTour = tour.get({ plain: true });
        titles[plainTour.slug] = plainTour.translations?.[0]?.title || plainTour.title || '';
        return titles;
    }, {});
};

const isApprovedBookingMessage = (message = '') => {
    const normalized = String(message).toLowerCase();
    return normalized.includes('approved')
        || normalized.includes('duyệt')
        || normalized.includes('duyet')
        || normalized.includes('审核')
        || normalized.includes('通過')
        || normalized.includes('通过');
};

const localizeNotification = (notification, language, titleBySlug) => {
    const lang = normalizeLanguage(language);
    const item = notification.get ? notification.get({ plain: true }) : notification;
    const tourTitle = titleBySlug[item.related_slug] || extractQuotedText(item.message);
    const copy = MESSAGE_COPY[lang] || MESSAGE_COPY.vi;

    let localizedMessage = item.message;
    if (item.type === 'like') {
        localizedMessage = copy.like(tourTitle);
    }
    if (item.type === 'reply') {
        localizedMessage = copy.reply(tourTitle);
    }
    if (item.type === 'booking') {
        localizedMessage = isApprovedBookingMessage(item.message)
            ? copy.bookingApproved(tourTitle)
            : copy.bookingCreated(tourTitle);
    }

    return {
        ...item,
        sender_name: item.type === 'booking' ? SYSTEM_SENDER[lang] : item.sender_name,
        localized_message: localizedMessage,
    };
};

const localizeNotifications = async (notifications, language) => {
    const lang = normalizeLanguage(language);
    const titleBySlug = await getLocalizedTourTitles({
        slugs: notifications.map(notification => (
            notification.related_slug || notification.get?.('related_slug')
        )),
        language: lang,
    });

    return notifications.map(notification => localizeNotification(notification, lang, titleBySlug));
};

module.exports = {
    localizeNotifications,
};
