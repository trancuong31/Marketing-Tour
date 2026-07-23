/**
 * Migration: create editable UI translations and seed from frontend i18n JSON.
 * Run: node src/migrations/create_ui_translations.js
 */
require('../config/env');
const fs = require('fs');
const path = require('path');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const logger = require('../config/logger');

const LANGUAGES = ['vi', 'en', 'zh'];
const FRONTEND_I18N_DIR = path.resolve(__dirname, '../../../frontend/src/i18n');

const normalizeTableName = (table) => {
    if (typeof table === 'string') return table;
    return table?.tableName || table?.table_name || table?.name || '';
};

const flattenObject = (value, prefix = '', output = {}) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        output[prefix] = value == null ? '' : String(value);
        return output;
    }

    Object.entries(value).forEach(([key, child]) => {
        flattenObject(child, prefix ? `${prefix}.${key}` : key, output);
    });

    return output;
};

const readLanguageFiles = (language) => {
    const languageDir = path.join(FRONTEND_I18N_DIR, language);
    if (!fs.existsSync(languageDir)) return {};

    return fs.readdirSync(languageDir)
        .filter(file => file.endsWith('.json'))
        .reduce((translations, file) => {
            const namespace = path.basename(file, '.json');
            const filePath = path.join(languageDir, file);
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const flattened = flattenObject(content);

            Object.entries(flattened).forEach(([key, text]) => {
                translations[`${namespace}.${key}`] = text;
            });

            return translations;
        }, {});
};

const buildSeedRows = () => {
    const byLanguage = Object.fromEntries(
        LANGUAGES.map(language => [language, readLanguageFiles(language)]),
    );
    const keys = new Set(LANGUAGES.flatMap(language => Object.keys(byLanguage[language])));
    const now = new Date();

    return Array.from(keys).sort().map((key) => ({
        translation_key: key,
        description: key,
        vi: byLanguage.vi[key] || '',
        en: byLanguage.en[key] || '',
        zh: byLanguage.zh[key] || '',
        created_at: now,
        updated_at: now,
    }));
};

const ensureTranslationsTable = async (queryInterface, existingTables) => {
    if (!existingTables.includes('translations')) {
        await queryInterface.createTable('translations', {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            translation_key: { type: DataTypes.STRING(160), allowNull: false, unique: true },
            description: { type: DataTypes.STRING(255), allowNull: true },
            vi: { type: DataTypes.TEXT, allowNull: true },
            en: { type: DataTypes.TEXT, allowNull: true },
            zh: { type: DataTypes.TEXT, allowNull: true },
            created_at: { type: DataTypes.DATE, allowNull: false },
            updated_at: { type: DataTypes.DATE, allowNull: false },
        });
        logger.info('Created translations table.');
        return;
    }

    const indexes = await queryInterface.showIndex('translations');
    const hasKeyIndex = indexes.some(index => index.name === 'translations_translation_key');
    if (!hasKeyIndex) {
        await queryInterface.addIndex('translations', ['translation_key'], {
            unique: true,
            name: 'translations_translation_key',
        });
    }
};

const run = async () => {
    try {
        await sequelize.authenticate();
        const queryInterface = sequelize.getQueryInterface();
        const existingTables = (await queryInterface.showAllTables()).map(normalizeTableName);

        await ensureTranslationsTable(queryInterface, existingTables);

        const rows = buildSeedRows();
        if (rows.length > 0) {
            await queryInterface.bulkInsert('translations', rows, {
                updateOnDuplicate: ['description', 'vi', 'en', 'zh', 'updated_at'],
            });
        }

        logger.info(`Seeded ${rows.length} UI translations.`);
        process.exitCode = 0;
    } catch (error) {
        logger.error('UI translation migration failed:', error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

run();
