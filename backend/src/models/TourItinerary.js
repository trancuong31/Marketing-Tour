const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TourItinerary = sequelize.define('TourItinerary', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    tour_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    day_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Ngày thứ mấy (1, 2, 3...)',
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Tiêu đề (VD: Ngày 1: Đón khách - Tham quan)',
    },
    content: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
        comment: 'Chi tiết các hoạt động trong ngày',
    },
}, {
    tableName: 'tour_itineraries',
    timestamps: false,
});

module.exports = TourItinerary;
