const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UiTranslation = sequelize.define('UiTranslation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    translation_key: {
        type: DataTypes.STRING(160),
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    vi: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    en: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    zh: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'translations',
    timestamps: true,
});

module.exports = UiTranslation;
