/**
 * Migration: Add detailed booking fields
 * Run: node src/migrations/run_migration.js
 */
require('../config/env');
const { sequelize } = require('../config/database');

const run = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        // Check existing columns
        const columns = await sequelize.getQueryInterface().describeTable('bookings');
        
        if (columns.departure_date) {
            console.log('⚠️  Columns already exist, skipping migration.');
            process.exit(0);
        }

        await sequelize.getQueryInterface().addColumn('bookings', 'departure_date', {
            type: require('sequelize').DataTypes.DATEONLY,
            allowNull: true,
            after: 'customer_note',
        });
        console.log('  + departure_date');

        await sequelize.getQueryInterface().addColumn('bookings', 'adult_count', {
            type: require('sequelize').DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            after: 'departure_date',
        });
        console.log('  + adult_count');

        await sequelize.getQueryInterface().addColumn('bookings', 'child_count', {
            type: require('sequelize').DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            after: 'adult_count',
        });
        console.log('  + child_count');

        await sequelize.getQueryInterface().addColumn('bookings', 'infant_count', {
            type: require('sequelize').DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            after: 'child_count',
        });
        console.log('  + infant_count');

        await sequelize.getQueryInterface().addColumn('bookings', 'total_price', {
            type: require('sequelize').DataTypes.DECIMAL(15, 2),
            allowNull: true,
            after: 'infant_count',
        });
        console.log('  + total_price');

        console.log('✅ Migration successful!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

run();
