require('./config/env');
const app = require('./app');
const { connectDB } = require('./config/database');
const logger = require('./config/logger');
const { startReviewReminderScheduler } = require('./jobs');

// Import models để đăng ký associations
require('./models');

const PORT = process.env.PORT || 3000;
let server;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    logger.error('Full error:', err);
    logger.error('Stack:', err.stack);
    process.exitCode = 1;
    throw err;
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
        server = app.listen(PORT, () => {
            logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });

        startReviewReminderScheduler();

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
            logger.error(err.name, err.message);
            server.close(() => {
                process.exitCode = 1;
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
        process.exitCode = 1;
        throw error;
    }
};

startServer();
