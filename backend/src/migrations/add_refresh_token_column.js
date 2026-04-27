/**
 * Migration: Add refresh_token column to users table
 * Run: node src/migrations/add_refresh_token_column.js
 */
require('../config/env');
const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

const run = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        const columns = await sequelize.getQueryInterface().describeTable('users');
        
        if (columns.refresh_token) {
            console.log('⚠️  Column refresh_token already exists, skipping.');
        } else {
            await sequelize.getQueryInterface().addColumn('users', 'refresh_token', {
                type: DataTypes.TEXT,
                allowNull: true,
                after: 'last_login'
            });
            console.log('✅ Added refresh_token column');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
};

run();
