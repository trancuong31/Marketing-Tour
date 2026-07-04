const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TourItineraryTranslation = sequelize.define('TourItineraryTranslation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    itinerary_id: {
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
    content: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
    },
}, {
    tableName: 'tour_itinerary_translations',
    timestamps: false,
});

module.exports = TourItineraryTranslation;
