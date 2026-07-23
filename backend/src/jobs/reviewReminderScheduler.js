const cron = require('node-cron');
const env = require('../config/env');
const logger = require('../config/logger');
const { sendPendingReviewReminderEmails } = require('../services/reviewReminderService');

const checkAndSendReviewReminders = async () => {
    const result = await sendPendingReviewReminderEmails({
        limit: env.reviewReminder.limit,
    });

    logger.info(`[ReviewReminder] scanned=${result.scanned} sent=${result.sent} failed=${result.failed}`);
    return result;
};

const startReviewReminderScheduler = () => {
    if (!env.reviewReminder.enabled) {
        logger.info('[ReviewReminder] Review reminder email scheduler is disabled.');
        return;
    }

    cron.schedule(env.reviewReminder.cron, () => {
        logger.info('[ReviewReminder] Scheduled email check triggered.');
        checkAndSendReviewReminders().catch((error) => {
            logger.error('[ReviewReminder] Scheduled email check failed:', error);
        });
    });

    checkAndSendReviewReminders().catch((error) => {
        logger.error('[ReviewReminder] Initial email check failed:', error);
    });
};

module.exports = {
    checkAndSendReviewReminders,
    startReviewReminderScheduler,
};
