/**
 * Removes the deprecated description field from UI translations.
 * Run once with: node src/migrations/remove_ui_translation_description.js
 */
require('../config/env');
const mariadb = require('mariadb');
const logger = require('../config/logger');

const run = async () => {
    let connection;

    try {
        connection = await mariadb.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
        const columns = await connection.query(
            `SELECT COLUMN_NAME
             FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
               AND COLUMN_NAME = ?`,
            ['translations', 'description'],
        );

        if (columns.length > 0) {
            await connection.query('ALTER TABLE `translations` DROP COLUMN `description`');
            logger.info('Removed translations.description.');
        } else {
            logger.info('translations.description is already absent.');
        }
    } catch (error) {
        logger.error('Unable to remove translations.description:', error);
        process.exitCode = 1;
    } finally {
        await connection?.end();
    }
};

run();
