const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TourTranslation = sequelize.define('TourTranslation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    tour_id: {
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
    summary: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    highlights: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price_includes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price_excludes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    terms_and_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    cancellation_policy: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'tour_translations',
    timestamps: false,
});

module.exports = TourTranslation;
