const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TourOption = sequelize.define('TourOption', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    tour_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    option_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Tên option (VD: Yêu cầu giường đôi, Phụ thu phòng đơn)',
    },
    price: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
        comment: 'Giá cộng thêm (có thể = 0)',
    },
    charge_type: {
        type: DataTypes.ENUM('per_person', 'per_booking', 'quantity'),
        defaultValue: 'quantity',
        comment: 'Cách tính: theo người, theo đơn, hoặc tự chọn số lượng',
    },
}, {
    tableName: 'tour_options',
    timestamps: false,
});

module.exports = TourOption;
