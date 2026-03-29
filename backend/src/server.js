require('./config/env');
const app = require('./app');
const { connectDB } = require('./config/database');
const logger = require('./config/logger');

// Import models để đăng ký associations
require('./models');

const PORT = process.env.PORT || 3000;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error('Full error:', err);
    console.error('Stack:', err.stack);
    process.exit(1);
});

// Connect to database and start server
const startServer = async () => {
    try {
        // Connect to MariaDB
        await connectDB();

        // Sync models - chỉ sync nếu cần, không alter vì bảng đã tồn tại
        if (process.env.NODE_ENV === 'development') {
            // Nếu muốn tự động tạo bảng mới, dùng sync() không có alter
            // await sequelize.sync();
            logger.info('Database connected. Tables should already exist.');
        }

        // Start server
        const server = app.listen(PORT, () => {
            logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
            logger.error(err.name, err.message);
            server.close(() => {
                process.exit(1);
            });
        });

        // Handle SIGTERM
        process.on('SIGTERM', () => {
            logger.info('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                logger.info('Process terminated.');
            });
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
