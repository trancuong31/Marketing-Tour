/**
 * Migration: add language column to users table.
 * Run: node src/migrations/add_user_language_column.js
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

        if (columns.language) {
            logger.warn('Column language already exists in users table, skipping migration.');
            process.exitCode = 0;
            return;
        }

        await queryInterface.addColumn('users', 'language', {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'vi',
        });
        logger.info('Added language column to users table.');
        process.exitCode = 0;
    } catch (error) {
        logger.error('Error running migration:', error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

run();
