require('../config/env');
const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

async function up() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        const queryInterface = sequelize.getQueryInterface();
        const columns = await queryInterface.describeTable('users');
        
        if (columns.language) {
            console.log('⚠️  Column "language" already exists in "users" table, skipping migration.');
            process.exit(0);
        }

        console.log('Adding language column to users table...');
        await queryInterface.addColumn('users', 'language', {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'vi',
        });
        console.log('Successfully added language column.');
        process.exit(0);
    } catch (error) {
        console.error('Error running migration:', error);
        process.exit(1);
    }
}

up();
