const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tour = sequelize.define('Tour', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    summary: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    content: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    sale_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
    },
    departure_point: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    duration_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    thumbnail_url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    is_featured: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM('active', 'hidden', 'sold_out'),
        defaultValue: 'active',
    },
}, {
    tableName: 'tours',
    timestamps: false,
});

module.exports = Tour;
