/**
 * Create and seed the singleton site contact configuration.
 * Run: node src/migrations/create_contact_settings.js
 */
require('../config/env');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const logger = require('../config/logger');
const ContactSetting = require('../models/ContactSetting');
const { DEFAULT_CONTACT_SETTINGS } = require('../constants/contactSettings');

const normalizeTableName = (table) => (
    typeof table === 'string' ? table : table?.tableName || table?.table_name || table?.name || ''
);

const migrate = async () => {
    try {
        await sequelize.authenticate();
        const queryInterface = sequelize.getQueryInterface();
        const existingTables = (await queryInterface.showAllTables()).map(normalizeTableName);

        if (!existingTables.includes('contact_settings')) {
            await queryInterface.createTable('contact_settings', {
                id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
                configuration: { type: DataTypes.JSON, allowNull: false },
                updated_by: { type: DataTypes.INTEGER, allowNull: true },
                created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
                updated_at: { type: DataTypes.DATE, allowNull: false },
            });
            logger.info('Created contact_settings table.');
        } else {
            const columns = await queryInterface.describeTable('contact_settings');
            if (!columns.created_at) {
                await queryInterface.addColumn('contact_settings', 'created_at', {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                });
                logger.info('Added contact_settings.created_at without changing existing configuration.');
            }
        }

        await sequelize.query(
            'UPDATE contact_settings SET created_at = COALESCE(updated_at, CURRENT_TIMESTAMP) WHERE created_at IS NULL'
        );

        await ContactSetting.findOrCreate({
            where: { id: 1 },
            defaults: {
                id: 1,
                configuration: DEFAULT_CONTACT_SETTINGS,
                updated_by: null,
                created_at: new Date(),
                updated_at: new Date(),
            },
        });
        logger.info('Ensured initial contact settings without overwriting existing values.');
        process.exitCode = 0;
    } catch (error) {
        logger.error('Contact settings migration failed:', error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

migrate();