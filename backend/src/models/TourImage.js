const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TourImage = sequelize.define('TourImage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    tour_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    image_url: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    tableName: 'tour_images',
    timestamps: false,
});

module.exports = TourImage;
