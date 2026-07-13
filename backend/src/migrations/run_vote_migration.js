/**
 * Migration: add images column to votes table.
 * Run: node src/migrations/run_vote_migration.js
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
        const columns = await queryInterface.describeTable('votes');

        if (columns.images) {
            logger.warn('Column images already exists, skipping migration.');
            process.exitCode = 0;
            return;
        }

        await queryInterface.addColumn('votes', 'images', {
            type: DataTypes.JSON,
            allowNull: true,
            after: 'comment',
        });
        logger.info('Added images column to votes table.');
        process.exitCode = 0;
    } catch (error) {
        logger.error('Migration failed:', error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

run();
