/**
 * Migration: create i18n translation tables and copy Vietnamese source data.
 * Run: node src/migrations/run_i18n_migration.js
 */
require('../config/env');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const logger = require('../config/logger');

const copySourceData = async (sql, label) => {
    await sequelize.query(sql);
    logger.info(`Copied existing ${label} to translation table.`);
};

const normalizeTableName = (table) => {
    if (typeof table === 'string') return table;
    return table?.tableName || table?.table_name || table?.name || '';
};

const getExistingTableNames = async (queryInterface) => {
    const tables = await queryInterface.showAllTables();
    return tables.map(normalizeTableName);
};

const hasTable = (existingTables, tableName) => existingTables.includes(tableName);

const addUniqueIndexIfMissing = async (queryInterface, tableName, fields, name) => {
    const indexes = await queryInterface.showIndex(tableName);
    const indexExists = indexes.some((index) => index.name === name);

    if (indexExists) {
        return;
    }

    await queryInterface.addIndex(tableName, fields, {
        unique: true,
        name,
    });
};

const ensureUserLanguage = async (queryInterface) => {
    const userColumns = await queryInterface.describeTable('users');

    if (userColumns.language) {
        return;
    }

    await queryInterface.addColumn('users', 'language', {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'vi',
    });
    logger.info('Added users.language column.');
};

const createTourTranslations = async (queryInterface, existingTables) => {
    if (hasTable(existingTables, 'tour_translations')) {
        await addUniqueIndexIfMissing(
            queryInterface,
            'tour_translations',
            ['tour_id', 'language'],
            'tour_translations_tour_id_language',
        );
        return;
    }

    await queryInterface.createTable('tour_translations', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        tour_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'tours', key: 'id' },
            onDelete: 'CASCADE',
        },
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
    await addUniqueIndexIfMissing(
        queryInterface,
        'tour_translations',
        ['tour_id', 'language'],
        'tour_translations_tour_id_language',
    );
    logger.info('Created tour_translations table.');

    await copySourceData(`
        INSERT INTO tour_translations (
            tour_id, language, title, slug, summary, highlights,
            price_includes, price_excludes, terms_and_notes, cancellation_policy
        )
        SELECT id, 'vi', title, slug, summary, highlights,
            price_includes, price_excludes, terms_and_notes, cancellation_policy
        FROM tours
    `, 'tours');
};

const seedSapaTourTranslations = async () => {
    await sequelize.query(`
        INSERT INTO tour_translations (
            tour_id, language, title, slug, summary, highlights,
            price_includes, price_excludes, terms_and_notes, cancellation_policy
        )
        VALUES
            (
                1,
                'en',
                'Sapa Discovery Tour - Conquer Fansipan Peak 3',
                'sapa-discovery-tour-conquer-fansipan-peak-3',
                'Journey to the misty mountain town, explore Cat Cat village, and conquer the roof of Indochina.',
                NULL, NULL, NULL, NULL, NULL
            ),
            (
                1,
                'zh',
                '沙巴探索之旅 - 征服番西邦峰 3',
                'sha-ba-tan-suo-zhi-lv-zheng-fu-fan-xi-bang-feng-3',
                '前往云雾缭绕的山城，探索猫猫村，并征服印度支那屋脊。',
                NULL, NULL, NULL, NULL, NULL
            ),
            (
                8,
                'en',
                'Sapa Discovery Tour - Conquer Fansipan Peak 1',
                'sapa-discovery-tour-conquer-fansipan-peak-1',
                'Journey to the misty mountain town, explore Cat Cat village, and conquer the roof of Indochina.',
                NULL, NULL, NULL, NULL, NULL
            ),
            (
                8,
                'zh',
                '沙巴探索之旅 - 征服番西邦峰 1',
                'sha-ba-tan-suo-zhi-lv-zheng-fu-fan-xi-bang-feng-1',
                '前往云雾缭绕的山城，探索猫猫村，并征服印度支那屋脊。',
                NULL, NULL, NULL, NULL, NULL
            ),
            (
                9,
                'en',
                'Sapa Discovery Tour - Conquer Fansipan Peak 2',
                'sapa-discovery-tour-conquer-fansipan-peak-2',
                'Journey to the misty mountain town, explore Cat Cat village, and conquer the roof of Indochina.',
                NULL, NULL, NULL, NULL, NULL
            ),
            (
                9,
                'zh',
                '沙巴探索之旅 - 征服番西邦峰 2',
                'sha-ba-tan-suo-zhi-lv-zheng-fu-fan-xi-bang-feng-2',
                '前往云雾缭绕的山城，探索猫猫村，并征服印度支那屋脊。',
                NULL, NULL, NULL, NULL, NULL
            )
        ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            slug = VALUES(slug),
            summary = VALUES(summary)
    `);
    logger.info('Seeded Sapa tour translations.');
};

const createItineraryTranslations = async (queryInterface, existingTables) => {
    if (hasTable(existingTables, 'tour_itinerary_translations')) {
        await addUniqueIndexIfMissing(
            queryInterface,
            'tour_itinerary_translations',
            ['itinerary_id', 'language'],
            'tour_itinerary_translations_itinerary_id_language',
        );
        return;
    }

    await queryInterface.createTable('tour_itinerary_translations', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        itinerary_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'tour_itineraries', key: 'id' },
            onDelete: 'CASCADE',
        },
        language: { type: DataTypes.STRING(10), allowNull: false },
        title: { type: DataTypes.STRING(255), allowNull: false },
        content: { type: DataTypes.TEXT('long'), allowNull: false },
    });
    await addUniqueIndexIfMissing(
        queryInterface,
        'tour_itinerary_translations',
        ['itinerary_id', 'language'],
        'tour_itinerary_translations_itinerary_id_language',
    );
    logger.info('Created tour_itinerary_translations table.');

    await copySourceData(`
        INSERT INTO tour_itinerary_translations (itinerary_id, language, title, content)
        SELECT id, 'vi', title, content
        FROM tour_itineraries
    `, 'tour itineraries');
};

const createCategoryTranslations = async (queryInterface, existingTables) => {
    if (hasTable(existingTables, 'category_translations')) {
        await addUniqueIndexIfMissing(
            queryInterface,
            'category_translations',
            ['category_id', 'language'],
            'category_translations_category_id_language',
        );
        return;
    }

    await queryInterface.createTable('category_translations', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'categories', key: 'id' },
            onDelete: 'CASCADE',
        },
        language: { type: DataTypes.STRING(10), allowNull: false },
        name: { type: DataTypes.STRING(100), allowNull: false },
        slug: { type: DataTypes.STRING(120), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
    });
    await addUniqueIndexIfMissing(
        queryInterface,
        'category_translations',
        ['category_id', 'language'],
        'category_translations_category_id_language',
    );
    logger.info('Created category_translations table.');

    await copySourceData(`
        INSERT INTO category_translations (category_id, language, name, slug, description)
        SELECT id, 'vi', name, slug, description
        FROM categories
    `, 'categories');
};

const createGuideTranslations = async (queryInterface, existingTables) => {
    if (hasTable(existingTables, 'guide_translations')) {
        await addUniqueIndexIfMissing(
            queryInterface,
            'guide_translations',
            ['guide_id', 'language'],
            'guide_translations_guide_id_language',
        );
        return;
    }

    await queryInterface.createTable('guide_translations', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        guide_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'guides', key: 'id' },
            onDelete: 'CASCADE',
        },
        language: { type: DataTypes.STRING(10), allowNull: false },
        title: { type: DataTypes.STRING(255), allowNull: false },
        slug: { type: DataTypes.STRING(255), allowNull: false },
        content: { type: DataTypes.TEXT('long'), allowNull: false },
    });
    await addUniqueIndexIfMissing(
        queryInterface,
        'guide_translations',
        ['guide_id', 'language'],
        'guide_translations_guide_id_language',
    );
    logger.info('Created guide_translations table.');

    await copySourceData(`
        INSERT INTO guide_translations (guide_id, language, title, slug, content)
        SELECT id, 'vi', title, slug, content
        FROM guides
    `, 'guides');
};

const seedDefaultGuideTranslations = async () => {
    await sequelize.query(`
        INSERT INTO guide_translations (guide_id, language, title, slug, content)
        VALUES
            (
                1,
                'en',
                'How to Book a Tour on the System',
                'how-to-book-a-tour-on-the-system',
                '<h2>How&nbsp;to&nbsp;book&nbsp;a&nbsp;tour</h2><p>Step&nbsp;1:&nbsp;Choose&nbsp;a&nbsp;tour...&nbsp;Step&nbsp;2:&nbsp;Enter&nbsp;your&nbsp;information...&nbsp;Step&nbsp;3:&nbsp;Wait&nbsp;for&nbsp;admin&nbsp;contact.1</p>'
            ),
            (
                1,
                'zh',
                '如何在系统上预订旅游',
                'ru-he-zai-xi-tong-shang-yu-ding-lv-you',
                '<h2>如何预订旅游</h2><p>步骤&nbsp;1：选择旅游产品...&nbsp;步骤&nbsp;2：填写您的信息...&nbsp;步骤&nbsp;3：等待管理员联系。1</p>'
            ),
            (
                2,
                'en',
                'Tour Cancellation and Refund Policy',
                'tour-cancellation-and-refund-policy',
                '<h2>Cancellation&nbsp;Policy</h2><p>Cancel&nbsp;7&nbsp;days&nbsp;in&nbsp;advance&nbsp;for&nbsp;a&nbsp;100%&nbsp;refund.&nbsp;Cancel&nbsp;3&nbsp;days&nbsp;in&nbsp;advance&nbsp;for&nbsp;a&nbsp;50%&nbsp;refund.</p>'
            ),
            (
                2,
                'zh',
                '旅游取消和退款政策',
                'lv-you-qu-xiao-he-tui-kuan-zheng-ce',
                '<h2>取消政策</h2><p>提前&nbsp;7&nbsp;天取消可退还&nbsp;100%&nbsp;费用。提前&nbsp;3&nbsp;天取消可退还&nbsp;50%&nbsp;费用。</p>'
            )
        ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            slug = VALUES(slug),
            content = VALUES(content)
    `);
    logger.info('Seeded default guide translations.');
};

const run = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Connected to database.');

        const queryInterface = sequelize.getQueryInterface();
        const existingTables = await getExistingTableNames(queryInterface);

        await ensureUserLanguage(queryInterface);
        await createTourTranslations(queryInterface, existingTables);
        await seedSapaTourTranslations();
        await createItineraryTranslations(queryInterface, existingTables);
        await createCategoryTranslations(queryInterface, existingTables);
        await createGuideTranslations(queryInterface, existingTables);
        await seedDefaultGuideTranslations();

        logger.info('i18n migration successful.');
        process.exitCode = 0;
    } catch (error) {
        logger.error('Migration failed:', error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

run();
