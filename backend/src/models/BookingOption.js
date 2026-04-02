const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BookingOption = sequelize.define('BookingOption', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    booking_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    option_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Lưu cứng text tên option để tránh mất data khi admin xóa',
    },
    price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Giá option tại thời điểm khách đặt',
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Số lượng khách chọn',
    },
    total: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Thành tiền của option này (price * quantity)',
    },
}, {
    tableName: 'booking_options',
    timestamps: false,
});

module.exports = BookingOption;
