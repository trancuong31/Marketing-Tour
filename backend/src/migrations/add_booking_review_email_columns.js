/**
 * Migration: add booking language snapshot and review reminder tracking.
 * Run: node src/migrations/add_booking_review_email_columns.js
 */
require('../config/env');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const logger = require('../config/logger');

const BOOKING_COLUMNS = [
    {
        name: 'language',
        definition: {
            type: DataTypes.STRING(5),
            allowNull: false,
            defaultValue: 'vi',
            after: 'customer_note',
        },
    },
    {
        name: 'review_email_sent_at',
        definition: {
            type: DataTypes.DATE,
            allowNull: true,
            after: 'language',
        },
    },
];

const BOOKING_INDEXES = [
    {
        name: 'booking_language',
        fields: ['language'],
    },
    {
        name: 'booking_review_email_sent_at',
        fields: ['review_email_sent_at'],
    },
];

const hasIndex = (indexes, indexName) => indexes.some(index => index.name === indexName);

const run = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Connected to database.');

        const queryInterface = sequelize.getQueryInterface();
        const columns = await queryInterface.describeTable('bookings');

        for (const column of BOOKING_COLUMNS) {
            if (columns[column.name]) {
                logger.info(`Column bookings.${column.name} already exists, skipping.`);
                continue;
            }

            await queryInterface.addColumn('bookings', column.name, column.definition);
            logger.info(`Added bookings.${column.name} column.`);
        }

        const indexes = await queryInterface.showIndex('bookings');
        for (const index of BOOKING_INDEXES) {
            if (hasIndex(indexes, index.name)) {
                logger.info(`Index ${index.name} already exists, skipping.`);
                continue;
            }

            await queryInterface.addIndex('bookings', index.fields, { name: index.name });
            logger.info(`Added ${index.name} index.`);
        }

        logger.info('Booking review email migration successful.');
        process.exitCode = 0;
    } catch (error) {
        logger.error('Booking review email migration failed:', error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

run();
