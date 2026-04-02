const cron = require('node-cron');
const env = require('../config/env');
const logger = require('../config/logger');
const { getLogs } = require('../services/dataLogService');
const { sendEmail } = require('../utils/email');
const { buildAlertEmail } = require('../utils/alertEmailTemplate');

const checkAndAlert = async () => {
    
};

const startAlertScheduler = () => {
    const { alert } = env;

    if (!alert.enabled) {
        logger.info('[AlertScheduler] Alert system is disabled in .env');
        return;
    }
    const cronExpression = '0 * * * *';

    cron.schedule(cronExpression, () => {
        logger.info('[AlertScheduler] ⏰ Scheduled check triggered');
        checkAndAlert();
    });

    // Run initial check on startup
    checkAndAlert();
};

module.exports = { startAlertScheduler, checkAndAlert };
