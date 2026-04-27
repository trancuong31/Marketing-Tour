const { sequelize } = require('./src/config/database');

async function migrate() {
    try {
        await sequelize.query('ALTER TABLE votes ADD COLUMN images JSON DEFAULT NULL;');
        console.log('Migration completed successfully');
    } catch (err) {
        if (err.parent && err.parent.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists');
        } else {
            console.error('Migration failed:', err);
        }
    } finally {
        process.exit(0);
    }
}

migrate();
