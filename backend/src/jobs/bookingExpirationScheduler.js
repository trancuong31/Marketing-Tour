const cron = require('node-cron');
const env = require('../config/env');
const logger = require('../config/logger');
const { autoCancelExpiredBookings } = require('../services/bookingExpirationService');

const checkAndAutoCancelExpiredBookings = async () => {
    const result = await autoCancelExpiredBookings({
        limit: env.bookingExpiration.limit,
    });

    logger.info(
        `[BookingExpiration] Check completed: scanned=${result.scanned} cancelled=${result.cancelled} failed=${result.failed}`
    );
    return result;
};

const startBookingExpirationScheduler = () => {
    if (!env.bookingExpiration.enabled) {
        logger.info('[BookingExpiration] Auto-cancellation scheduler is disabled via config.');
        return;
    }

    cron.schedule(env.bookingExpiration.cron, () => {
        logger.info('[BookingExpiration] Scheduled check triggered.');
        checkAndAutoCancelExpiredBookings().catch((error) => {
            logger.error('[BookingExpiration] Scheduled check failed:', error);
        });
    });

    // Run initial scan on startup
    checkAndAutoCancelExpiredBookings().catch((error) => {
        logger.error('[BookingExpiration] Initial scan on startup failed:', error);
    });
};

module.exports = {
    checkAndAutoCancelExpiredBookings,
    startBookingExpirationScheduler,
};
