/**
 * Migration: Create i18n translation tables and copy default 'vi' data
 * Run: node src/migrations/run_i18n_migration.js
 */
require('../config/env');
const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

const run = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        const queryInterface = sequelize.getQueryInterface();

        // 1. Create users.language if not exists
        const userCols = await queryInterface.describeTable('users');
        if (!userCols.language) {
            await queryInterface.addColumn('users', 'language', {
                type: DataTypes.STRING(10),
                allowNull: false,
                defaultValue: 'vi',
            });
            console.log('  + Added users.language');
        }

        // 2. Create tour_translations
        const tourTransCols = await queryInterface.showAllTables();
        if (!tourTransCols.includes('tour_translations')) {
            await queryInterface.createTable('tour_translations', {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                tour_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'tours', key: 'id' }, onDelete: 'CASCADE' },
                language: { type: DataTypes.STRING(10), allowNull: false },
                title: { type: DataTypes.STRING(255), allowNull: false },
                slug: { type: DataTypes.STRING(255), allowNull: false },
                summary: { type: DataTypes.TEXT, allowNull: true },
                highlights: { type: DataTypes.TEXT, allowNull: true },
                price_includes: { type: DataTypes.TEXT, allowNull: true },
                price_excludes: { type: DataTypes.TEXT, allowNull: true },
                terms_and_notes: { type: DataTypes.TEXT, allowNull: true },
                cancellation_policy: { type: DataTypes.TEXT, allowNull: true },
            });
            await queryInterface.addIndex('tour_translations', ['tour_id', 'language'], { unique: true });
            console.log('  + Created tour_translations');

            // Copy data
            await sequelize.query(`
                INSERT INTO tour_translations (tour_id, language, title, slug, summary, highlights, price_includes, price_excludes, terms_and_notes, cancellation_policy)
                SELECT id, 'vi', title, slug, summary, highlights, price_includes, price_excludes, terms_and_notes, cancellation_policy
                FROM tours
            `);
            console.log('    -> Copied existing tours to tour_translations (vi)');
        }

        // 3. Create tour_itinerary_translations
        if (!tourTransCols.includes('tour_itinerary_translations')) {
            await queryInterface.createTable('tour_itinerary_translations', {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                itinerary_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'tour_itineraries', key: 'id' }, onDelete: 'CASCADE' },
                language: { type: DataTypes.STRING(10), allowNull: false },
                title: { type: DataTypes.STRING(255), allowNull: false },
                content: { type: DataTypes.TEXT('long'), allowNull: false },
            });
            await queryInterface.addIndex('tour_itinerary_translations', ['itinerary_id', 'language'], { unique: true });
            console.log('  + Created tour_itinerary_translations');

            // Copy data
            await sequelize.query(`
                INSERT INTO tour_itinerary_translations (itinerary_id, language, title, content)
                SELECT id, 'vi', title, content
                FROM tour_itineraries
            `);
            console.log('    -> Copied existing itineraries to tour_itinerary_translations (vi)');
        }

        // 4. Create category_translations
        if (!tourTransCols.includes('category_translations')) {
            await queryInterface.createTable('category_translations', {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                category_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'categories', key: 'id' }, onDelete: 'CASCADE' },
                language: { type: DataTypes.STRING(10), allowNull: false },
                name: { type: DataTypes.STRING(100), allowNull: false },
                slug: { type: DataTypes.STRING(120), allowNull: false },
                description: { type: DataTypes.TEXT, allowNull: true },
            });
            await queryInterface.addIndex('category_translations', ['category_id', 'language'], { unique: true });
            console.log('  + Created category_translations');

            // Copy data
            await sequelize.query(`
                INSERT INTO category_translations (category_id, language, name, slug, description)
                SELECT id, 'vi', name, slug, description
                FROM categories
            `);
            console.log('    -> Copied existing categories to category_translations (vi)');
        }

        // 5. Create guide_translations
        if (!tourTransCols.includes('guide_translations')) {
            await queryInterface.createTable('guide_translations', {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                guide_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'guides', key: 'id' }, onDelete: 'CASCADE' },
                language: { type: DataTypes.STRING(10), allowNull: false },
                title: { type: DataTypes.STRING(255), allowNull: false },
                slug: { type: DataTypes.STRING(255), allowNull: false },
                content: { type: DataTypes.TEXT('long'), allowNull: false },
            });
            await queryInterface.addIndex('guide_translations', ['guide_id', 'language'], { unique: true });
            console.log('  + Created guide_translations');

            // Copy data
            await sequelize.query(`
                INSERT INTO guide_translations (guide_id, language, title, slug, content)
                SELECT id, 'vi', title, slug, content
                FROM guides
            `);
            console.log('    -> Copied existing guides to guide_translations (vi)');
        }

        console.log('✅ i18n Migration successful!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

run();
