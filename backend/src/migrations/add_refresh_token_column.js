/**
 * Migration: add refresh_token column to users table.
 * Run: node src/migrations/add_refresh_token_column.js
 */
require('../config/env');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const logger = require('../config/logger');

const run = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Connected to database.');

        const queryInterface = sequelize.getQueryInterface();
        const columns = await queryInterface.describeTable('users');

        if (columns.refresh_token) {
            logger.warn('Column refresh_token already exists, skipping.');
        } else {
            await queryInterface.addColumn('users', 'refresh_token', {
                type: DataTypes.TEXT,
                allowNull: true,
                after: 'last_login',
            });
            logger.info('Added refresh_token column.');
        }

        process.exitCode = 0;
    } catch (error) {
        logger.error('Migration failed:', error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

run();
