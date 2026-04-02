const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { TOUR_BADGE } = require('../constants/tour_badge');

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
    highlights: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Điểm nổi bật của tour',
    },
    price_includes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Giá tour bao gồm',
    },
    price_excludes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Giá tour không bao gồm',
    },
    terms_and_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Điều khoản và lưu ý',
    },
    cancellation_policy: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Quy định hoàn hủy',
    },
    duration_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Số ngày',
    },
    duration_nights: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Số đêm',
    },
    thumbnail_url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    tour_badge: {
        type: DataTypes.ENUM(...Object.values(TOUR_BADGE)),
        defaultValue: TOUR_BADGE.NONE,
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
