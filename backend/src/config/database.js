const path = require('path');
const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');
const logger = require('./logger');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mariadb',
        dialectModule: require('mariadb'),
        timezone: '+07:00',

        logging: (msg) => logger.debug(msg),
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            timestamps: true,
            underscored: true,
        },
    },
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        logger.info('MariaDB connection established successfully.');

        if (process.env.NODE_ENV === 'development') {
            logger.info('Database connected. Tables should already exist.');
        }
    } catch (error) {
        logger.error('Unable to connect to MariaDB:', error);
        throw error;
    }
};

module.exports = { sequelize, connectDB };
