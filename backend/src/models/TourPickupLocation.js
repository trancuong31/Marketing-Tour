const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TourPickupLocation = sequelize.define('TourPickupLocation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    tour_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    location_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Tên điểm đón hoặc khu vực',
    },
    pickup_time: {
        type: DataTypes.TIME,
        allowNull: true,
        comment: 'Giờ đón dự kiến',
    },
    surcharge_amount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
        comment: 'Phí phụ thu nếu có (mặc định 0)',
    },
}, {
    tableName: 'tour_pickup_locations',
    timestamps: false,
});

module.exports = TourPickupLocation;
