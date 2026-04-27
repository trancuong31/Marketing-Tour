const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('like', 'reply', 'booking'),
        allowNull: false,
    },
    sender_name: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    related_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    related_slug: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    is_read: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'notifications',
    timestamps: false,
});

module.exports = Notification;
