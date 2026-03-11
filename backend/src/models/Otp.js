const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Otp = sequelize.define('Otp', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    otp_code: {
        type: DataTypes.STRING(6),
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('register', 'reset_password'),
        allowNull: false,
    },
    attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    expired_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'otps',
    timestamps: false,
});

module.exports = Otp;
