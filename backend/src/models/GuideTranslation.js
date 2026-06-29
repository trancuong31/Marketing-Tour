const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GuideTranslation = sequelize.define('GuideTranslation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    guide_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    language: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
    },
}, {
    tableName: 'guide_translations',
    timestamps: false,
});

module.exports = GuideTranslation;
