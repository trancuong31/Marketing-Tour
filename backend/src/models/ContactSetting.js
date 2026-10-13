const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ContactSetting = sequelize.define('ContactSetting', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    configuration: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'contact_settings',
    timestamps: false,
});

module.exports = ContactSetting;