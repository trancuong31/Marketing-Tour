const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const { errorHandler, apiLimiter } = require('./middlewares');
const { AppError } = require('./utils/appError');
const { HTTP_CODES } = require('./constants/httpCodes');
const path = require('path');

const app = express();

// Security middlewares
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
}));
app.use(cookieParser());

// Rate limiting
app.use('/api', apiLimiter);

// Body parsing (tăng limit cho upload)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', routes);

// Catch all → React routing
app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle undefined API routes
app.all('/api/*', (req, res, next) => {
    next(new AppError(
        `Không tìm thấy ${req.originalUrl} trên server`,
        HTTP_CODES.NOT_FOUND
    ));
});

// Global error handler
app.use(errorHandler);

module.exports = app;
