const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CategoryTranslation = sequelize.define('CategoryTranslation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    language: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    slug: {
        type: DataTypes.STRING(120),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'category_translations',
    timestamps: false,
});

module.exports = CategoryTranslation;
