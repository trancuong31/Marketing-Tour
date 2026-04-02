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
    number_of_people: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
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
