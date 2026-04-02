const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    tour_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    departure_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID của ngày khởi hành khách chọn',
    },
    pickup_location_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID điểm đón khách chọn',
    },
    booking_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
    },
    customer_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    customer_email: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    customer_phone: {
        type: DataTypes.STRING(15),
        allowNull: false,
    },
    adult_qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Số người lớn',
    },
    child_qty: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Số trẻ em',
    },
    infant_qty: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Số em bé',
    },
    customer_note: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    departure_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    adult_count: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    child_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    infant_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    total_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('pending', 'contacted', 'approved', 'cancelled'),
        defaultValue: 'pending',
    },
    total_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Tổng tiền thanh toán (Snapshot)',
    },
    admin_note: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'bookings',
    timestamps: false,
});

module.exports = Booking;
