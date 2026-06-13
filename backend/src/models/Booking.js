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

    status: {
        type: DataTypes.ENUM('pending', 'approved', 'cancelled'),
        defaultValue: 'pending',
    },
    total_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Tổng tiền thanh toán (Snapshot)',
    },
    tour_title_snapshot: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Snapshot tên tour tại thời điểm đặt',
    },
    departure_date_snapshot: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Snapshot ngày khởi hành tại thời điểm đặt',
    },
    adult_price_snapshot: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Snapshot giá người lớn tại thời điểm đặt',
    },
    child_price_snapshot: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Snapshot giá trẻ em tại thời điểm đặt',
    },
    infant_price_snapshot: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Snapshot giá em bé tại thời điểm đặt',
    },
    pickup_location_snapshot: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Snapshot tên điểm đón tại thời điểm đặt',
    },
    pickup_price_snapshot: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Snapshot phụ thu điểm đón tại thời điểm đặt',
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
