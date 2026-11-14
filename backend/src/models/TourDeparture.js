const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TourDeparture = sequelize.define(
  'TourDeparture',
  {
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
    original_price_adult: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: null,
      comment: 'Giá gốc người lớn trước khi giảm',
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
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Tổng số chỗ có thể bán',
    },
    available_seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Số chỗ còn có thể bán',
    },
    status: {
      type: DataTypes.ENUM('open', 'full', 'cancelled'),
      defaultValue: 'open',
      comment: 'Trạng thái mở bán',
    },
    flight: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Chặng bay / thông tin chuyến bay',
    },
    flight_outbound: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Thông tin chuyến bay chặng đi',
    },
    flight_inbound: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Thông tin chuyến bay chặng về',
    },
  },
  {
    tableName: 'tour_departures',
    timestamps: false,
  }
);

module.exports = TourDeparture;
