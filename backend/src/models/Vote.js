const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Vote = sequelize.define('Vote', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    tour_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    customer_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    customer_email: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0, max: 5 },
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    images: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    is_approved: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
    },
    likes_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    admin_reply: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    admin_reply_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'votes',
    timestamps: false,
});

module.exports = Vote;
