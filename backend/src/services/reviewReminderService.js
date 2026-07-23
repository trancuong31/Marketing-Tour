const { Op } = require('sequelize');
const {
    Booking,
    Tour,
    TourDeparture,
    TourTranslation,
    User,
    Vote,
} = require('../models');
const logger = require('../config/logger');
const { sendReviewReminderEmail } = require('../utils/email');
const { normalizeLanguage } = require('../utils/language');

const getTourEndDate = (departureDate, durationDays = 1) => {
    if (!departureDate) return null;

    const endDate = new Date(`${departureDate}T00:00:00`);
    if (Number.isNaN(endDate.getTime())) return null;

    endDate.setDate(endDate.getDate() + Math.max(1, durationDays || 1));
    return endDate;
};

const hasTourEnded = (booking) => {
    const endDate = getTourEndDate(
        booking.departure?.departure_date || booking.departure_date_snapshot,
        booking.Tour?.duration_days,
    );

    return endDate ? endDate <= new Date() : false;
};

const getLocalizedTour = (tour, language) => {
    const translation = tour?.translations?.find(item => item.language === language);

    return {
        title: translation?.title || tour?.title || '',
        slug: translation?.slug || tour?.slug || '',
    };
};

const findPendingReviewReminderBookings = async ({ limit = 50 } = {}) => {
    const bookings = await Booking.findAll({
        where: {
            status: 'approved',
            user_id: { [Op.ne]: null },
            review_email_sent_at: null,
            customer_email: { [Op.ne]: '' },
        },
        include: [
            {
                model: Tour,
                attributes: ['id', 'title', 'slug', 'duration_days'],
                include: [{
                    model: TourTranslation,
                    as: 'translations',
                    attributes: ['language', 'title', 'slug'],
                    required: false,
                }],
            },
            {
                model: TourDeparture,
                as: 'departure',
                attributes: ['departure_date'],
            },
            {
                model: User,
                attributes: ['id', 'language'],
            },
        ],
        order: [['departure_date_snapshot', 'ASC'], ['id', 'ASC']],
        limit: Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200),
    });

    const endedBookings = bookings.filter(hasTourEnded);
    if (endedBookings.length === 0) return [];

    const bookingReviewPairs = await Promise.all(endedBookings.map(async (booking) => {
        const existingVote = await Vote.findOne({
            where: {
                tour_id: booking.tour_id,
                user_id: booking.user_id,
                parent_id: null,
            },
            attributes: ['id'],
        });

        return { booking, existingVote };
    }));

    return bookingReviewPairs
        .filter(({ existingVote }) => !existingVote)
        .map(({ booking }) => booking);
};

const sendPendingReviewReminderEmails = async ({ limit = 50 } = {}) => {
    const bookings = await findPendingReviewReminderBookings({ limit });
    let sent = 0;
    let failed = 0;

    for (const booking of bookings) {
        const language = normalizeLanguage(booking.language || booking.User?.language);
        const localizedTour = getLocalizedTour(booking.Tour, language);

        try {
            await sendReviewReminderEmail({
                email: booking.customer_email,
                customerName: booking.customer_name,
                tourTitle: localizedTour.title || booking.tour_title_snapshot,
                tourSlug: localizedTour.slug || booking.Tour?.slug,
                language,
            });

            await booking.update({ review_email_sent_at: new Date() });
            sent += 1;
        } catch (error) {
            failed += 1;
            logger.error(`Failed to send review reminder for booking ${booking.id}:`, error);
        }
    }

    return {
        scanned: bookings.length,
        sent,
        failed,
    };
};

module.exports = {
    findPendingReviewReminderBookings,
    sendPendingReviewReminderEmails,
};
