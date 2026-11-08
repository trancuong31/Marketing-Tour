/**
 * Migration: Create footer_links table and seed defaults
 * Run: node src/migrations/create_footer_links.js
 */
require('../config/env');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const logger = require('../config/logger');
const FooterLink = require('../models/FooterLink');

const normalizeTableName = (table) => (
    typeof table === 'string' ? table : table?.tableName || table?.table_name || table?.name || ''
);

const defaultFooterLinks = [
    // Cột 1: Về chúng tôi
    { title: 'Về Chúng Tôi', url: '/guides/ve-chung-toi', link_type: 'internal', column_position: 1, sort_order: 1, is_active: 1 },
    { title: 'Blog Du Lịch', url: '/guides/blog-du-lich', link_type: 'internal', column_position: 1, sort_order: 2, is_active: 1 },
    // Cột 2: Hỗ trợ khách hàng
    { title: 'Câu Hỏi Thường Gặp', url: '/guides/cau-hoi-thuong-gap', link_type: 'internal', column_position: 2, sort_order: 1, is_active: 1 },
    { title: 'Hướng Dẫn Thanh Toán', url: '/guides/huong-dan-thanh-toan', link_type: 'internal', column_position: 2, sort_order: 2, is_active: 1 },
    // Cột 3: Chính sách & Quy định
    { title: 'Điều Khoản Sử Dụng', url: '/guides/dieu-khoan-su-dung', link_type: 'internal', column_position: 3, sort_order: 1, is_active: 1 },
    { title: 'Chính Sách Bảo Mật', url: '/guides/chinh-sach-bao-mat', link_type: 'internal', column_position: 3, sort_order: 2, is_active: 1 },
];

const migrate = async () => {
    try {
        await sequelize.authenticate();
        const queryInterface = sequelize.getQueryInterface();
        const existingTables = (await queryInterface.showAllTables()).map(normalizeTableName);

        if (!existingTables.includes('footer_links')) {
            await queryInterface.createTable('footer_links', {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                    allowNull: false,
                },
                title: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                url: {
                    type: DataTypes.STRING(500),
                    allowNull: false,
                },
                link_type: {
                    type: DataTypes.ENUM('internal', 'external'),
                    allowNull: false,
                    defaultValue: 'internal',
                },
                column_position: {
                    type: DataTypes.TINYINT,
                    allowNull: false,
                    defaultValue: 1,
                },
                sort_order: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
                is_active: {
                    type: DataTypes.TINYINT,
                    allowNull: false,
                    defaultValue: 1,
                },
                created_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
                updated_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
            });
            logger.info('Created table footer_links.');

            for (const link of defaultFooterLinks) {
                await FooterLink.create({
                    ...link,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
            }
            logger.info('Seeded default footer links.');
        } else {
            logger.info('Table footer_links already exists.');
        }

        process.exitCode = 0;
    } catch (error) {
        logger.error('Migration create_footer_links failed:', error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

migrate();

