/**
 * Migration: add detailed booking fields.
 * Run: node src/migrations/run_migration.js
 */
require('../config/env');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const logger = require('../config/logger');

const BOOKING_COLUMNS = [
    {
        name: 'departure_date',
        definition: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            after: 'customer_note',
        },
    },
    {
        name: 'adult_count',
        definition: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            after: 'departure_date',
        },
    },
    {
        name: 'child_count',
        definition: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            after: 'adult_count',
        },
    },
    {
        name: 'infant_count',
        definition: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            after: 'child_count',
        },
    },
    {
        name: 'total_price',
        definition: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            after: 'infant_count',
        },
    },
];

const run = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Connected to database.');

        const queryInterface = sequelize.getQueryInterface();
        const columns = await queryInterface.describeTable('bookings');

        for (const column of BOOKING_COLUMNS) {
            if (columns[column.name]) {
                logger.info(`Column ${column.name} already exists, skipping.`);
                continue;
            }

            await queryInterface.addColumn('bookings', column.name, column.definition);
            logger.info(`Added ${column.name} column.`);
        }

        logger.info('Migration successful.');
        process.exitCode = 0;
    } catch (error) {
        logger.error('Migration failed:', error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

run();
