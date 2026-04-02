const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TourDeparture = sequelize.define('TourDeparture', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    tour_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    departure_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Ngày khởi hành',
    },
    price_adult: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Giá người lớn',
    },
    price_child: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
        comment: 'Giá trẻ em',
    },
    price_infant: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
        comment: 'Giá em bé/trẻ nhỏ',
    },
    available_seats: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Số lượng khách tối đa nhận',
    },
    status: {
        type: DataTypes.ENUM('open', 'full', 'cancelled'),
        defaultValue: 'open',
        comment: 'Trạng thái mở bán',
    },
}, {
    tableName: 'tour_departures',
    timestamps: false,
});

module.exports = TourDeparture;
