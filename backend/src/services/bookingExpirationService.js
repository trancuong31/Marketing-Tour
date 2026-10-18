const { Op } = require('sequelize');
const {
    Booking,
    Tour,
    TourDeparture,
    TourTranslation,
    Notification,
} = require('../models');
const { sequelize } = require('../config/database');
const logger = require('../config/logger');
const { getTodayDateString } = require('../utils/date');
const { getNotificationCopy } = require('../utils/notificationMessages');

const getBookingPassengerCount = (booking) =>
    Number(booking.adult_qty || 0) +
    Number(booking.child_qty || 0) +
    Number(booking.infant_qty || 0);

/**
 * Quét và tự động hủy các đơn đặt tour còn ở trạng thái 'pending'
 * mà ngày khởi hành đã ở trong quá khứ (< referenceDate).
 *
 * @param {Object} options
 * @param {string} [options.referenceDate] - Ngày mốc so sánh dạng YYYY-MM-DD (mặc định là ngày hiện tại ở timezone Asia/Ho_Chi_Minh)
 * @param {number} [options.limit] - Giới hạn số lượng đơn quét mỗi lần chạy (mặc định 100)
 * @returns {Promise<{ scanned: number, cancelled: number, failed: number }>}
 */
const autoCancelExpiredBookings = async ({ referenceDate, limit = 100 } = {}) => {
    const todayStr = referenceDate || getTodayDateString('Asia/Ho_Chi_Minh');

    try {
        const pendingBookings = await Booking.findAll({
            where: {
                status: 'pending',
            },
            include: [
                {
                    model: TourDeparture,
                    as: 'departure',
                    attributes: ['id', 'departure_date', 'capacity', 'available_seats', 'status'],
                    required: false,
                },
                {
                    model: Tour,
                    attributes: ['id', 'title', 'slug'],
                    include: [
                        {
                            model: TourTranslation,
                            as: 'translations',
                            attributes: ['language', 'title', 'slug'],
                            required: false,
                        },
                    ],
                    required: false,
                },
            ],
            order: [['created_at', 'ASC']],
            limit: Math.max(1, parseInt(limit, 10) || 100),
        });

        const expiredBookings = pendingBookings.filter((booking) => {
            const rawDate = booking.departure?.departure_date || booking.departure_date_snapshot;
            if (!rawDate) return false;
            const departureDateStr = String(rawDate).slice(0, 10);
            return departureDateStr < todayStr;
        });

        if (expiredBookings.length === 0) {
            logger.info(`[BookingExpiration] No expired pending bookings found for date < ${todayStr}.`);
            return { scanned: 0, cancelled: 0, failed: 0 };
        }

        logger.info(
            `[BookingExpiration] Found ${expiredBookings.length} expired pending bookings to cancel (date < ${todayStr}).`
        );

        let cancelledCount = 0;
        let failedCount = 0;

        for (const booking of expiredBookings) {
            try {
                await sequelize.transaction(async (t) => {
                    const lockedBooking = await Booking.findByPk(booking.id, {
                        lock: t.LOCK.UPDATE,
                        transaction: t,
                    });

                    // Nếu trạng thái đã bị thay đổi bởi admin hoặc user trước đó thì bỏ qua
                    if (!lockedBooking || lockedBooking.status !== 'pending') {
                        return;
                    }

                    // Hoàn lại chỗ cho TourDeparture nếu có
                    if (lockedBooking.departure_id) {
                        const departure = await TourDeparture.findByPk(lockedBooking.departure_id, {
                            lock: t.LOCK.UPDATE,
                            transaction: t,
                        });

                        if (departure) {
                            const passengerCount = getBookingPassengerCount(lockedBooking);
                            const restoredSeats = Math.min(
                                Number(departure.capacity),
                                Number(departure.available_seats) + passengerCount
                            );

                            await departure.update(
                                {
                                    available_seats: restoredSeats,
                                    status: restoredSeats === 0 ? 'full' : 'open',
                                },
                                { transaction: t }
                            );
                        }
                    }

                    const autoNote = 'Hệ thống tự động hủy: Tour đã qua ngày khởi hành.';
                    const updatedAdminNote = lockedBooking.admin_note
                        ? `${lockedBooking.admin_note} | ${autoNote}`
                        : autoNote;

                    await lockedBooking.update(
                        {
                            status: 'cancelled',
                            admin_note: updatedAdminNote,
                        },
                        { transaction: t }
                    );

                    // Tạo thông báo nếu booking thuộc về user đã đăng ký
                    if (lockedBooking.user_id) {
                        const lang = lockedBooking.language || 'vi';
                        const notificationCopy = getNotificationCopy(lang);
                        const tour = booking.Tour;
                        const translatedTitle =
                            tour?.translations?.find((tr) => tr.language === lang)?.title ||
                            tour?.title ||
                            lockedBooking.tour_title_snapshot ||
                            'Tour';

                        const message = notificationCopy.bookingAutoCancelled
                            ? notificationCopy.bookingAutoCancelled(translatedTitle)
                            : `đơn đặt tour "${translatedTitle}" của bạn đã tự động hủy do tour đã qua ngày khởi hành.`;

                        await Notification.create(
                            {
                                user_id: lockedBooking.user_id,
                                type: 'booking',
                                sender_name: notificationCopy.system || 'Hệ thống',
                                message,
                                related_id: lockedBooking.id,
                                related_slug: tour?.slug || null,
                            },
                            { transaction: t }
                        );
                    }

                    cancelledCount += 1;
                });
            } catch (err) {
                failedCount += 1;
                logger.error(
                    `[BookingExpiration] Failed to auto-cancel booking #${booking.id} (${booking.booking_code}):`,
                    err
                );
            }
        }

        logger.info(
            `[BookingExpiration] Completed scan: total=${expiredBookings.length}, cancelled=${cancelledCount}, failed=${failedCount}.`
        );

        return {
            scanned: expiredBookings.length,
            cancelled: cancelledCount,
            failed: failedCount,
        };
    } catch (error) {
        logger.error('[BookingExpiration] Error during auto-cancel execution:', error);
        throw error;
    }
};

module.exports = {
    autoCancelExpiredBookings,
    getBookingPassengerCount,
};
