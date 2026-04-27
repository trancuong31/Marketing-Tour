const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VoteLike = sequelize.define('VoteLike', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    vote_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'vote_likes',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['vote_id', 'user_id']
        }
    ]
});

module.exports = VoteLike;
