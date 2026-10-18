const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FooterLink = sequelize.define('FooterLink', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
}, {
    tableName: 'footer_links',
    timestamps: false,
});

module.exports = FooterLink;
