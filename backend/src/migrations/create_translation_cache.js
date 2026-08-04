/**
 * Migration: create persistent translation cache for Azure/Google provider output.
 * Run: node src/migrations/create_translation_cache.js
 */
require('../config/env');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const logger = require('../config/logger');

const normalizeTableName = (table) => {
    if (typeof table === 'string') return table;
    return table?.tableName || table?.table_name || table?.name || '';
};

const ensureTranslationCacheTable = async (queryInterface, existingTables) => {
    if (!existingTables.includes('translation_cache')) {
        await queryInterface.createTable('translation_cache', {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            source_hash: { type: DataTypes.STRING(64), allowNull: false },
            source_language: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'vi' },
            target_language: { type: DataTypes.STRING(10), allowNull: false },
            provider: { type: DataTypes.STRING(30), allowNull: false },
            source_text: { type: DataTypes.TEXT('long'), allowNull: false },
            translated_text: { type: DataTypes.TEXT('long'), allowNull: false },
            created_at: { type: DataTypes.DATE, allowNull: false },
            updated_at: { type: DataTypes.DATE, allowNull: false },
        });
        logger.info('Created translation_cache table.');
    }

    const indexes = await queryInterface.showIndex('translation_cache');
    const hasUniqueIndex = indexes.some(index => index.name === 'translation_cache_unique_source');
    if (!hasUniqueIndex) {
        await queryInterface.addIndex('translation_cache', ['source_hash', 'source_language', 'target_language', 'provider'], {
            unique: true,
            name: 'translation_cache_unique_source',
        });
        logger.info('Created translation_cache_unique_source index.');
    }
};

const run = async () => {
    try {
        await sequelize.authenticate();
        const queryInterface = sequelize.getQueryInterface();
        const existingTables = (await queryInterface.showAllTables()).map(normalizeTableName);

        await ensureTranslationCacheTable(queryInterface, existingTables);
        process.exitCode = 0;
    } catch (error) {
        logger.error('Translation cache migration failed:', error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

run();
