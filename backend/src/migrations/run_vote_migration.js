require('../config/env');
const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

const run = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        const columns = await sequelize.getQueryInterface().describeTable('votes');
        
        if (columns.images) {
            console.log('⚠️  Column "images" already exists, skipping migration.');
            process.exit(0);
        }

        await sequelize.getQueryInterface().addColumn('votes', 'images', {
            type: DataTypes.JSON,
            allowNull: true,
            after: 'comment',
        });
        console.log('  + images');

        console.log('✅ Migration successful!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

run();
