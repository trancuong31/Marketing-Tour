const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Guide = sequelize.define('Guide', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    content: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
    },
    is_active: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'guides',
    timestamps: false,
});

module.exports = Guide;
