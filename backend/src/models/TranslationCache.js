const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TranslationCache = sequelize.define('TranslationCache', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    source_hash: {
        type: DataTypes.STRING(64),
        allowNull: false,
    },
    source_language: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'vi',
    },
    target_language: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    provider: {
        type: DataTypes.STRING(30),
        allowNull: false,
    },
    source_text: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
    },
    translated_text: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
    },
}, {
    tableName: 'translation_cache',
    timestamps: true,
    indexes: [
        {
            unique: true,
            name: 'translation_cache_unique_source',
            fields: ['source_hash', 'source_language', 'target_language', 'provider'],
        },
    ],
});

module.exports = TranslationCache;
