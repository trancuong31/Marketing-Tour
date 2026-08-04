const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVars = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,

    // Database
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        name: process.env.DB_NAME || 'db_marketing_tour',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
    },

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        refreshCookieMaxAge: parseInt(process.env.JWT_REFRESH_COOKIE_DAYS, 10) || 7,
    },

    // Email
    email: {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10) || 587,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        from: process.env.EMAIL_FROM || 'noreply@marketingtour.com',
    },

    reviewReminder: {
        enabled: process.env.REVIEW_REMINDER_ENABLED === 'true',
        cron: process.env.REVIEW_REMINDER_CRON || '0 9 * * *',
        limit: parseInt(process.env.REVIEW_REMINDER_LIMIT, 10) || 50,
    },

    translation: {
        provider: (process.env.TRANSLATION_PROVIDER || (process.env.AZURE_TRANSLATOR_KEY ? 'azure' : 'google')).toLowerCase(),
        concurrency: parseInt(process.env.TRANSLATION_CONCURRENCY, 10) || 1,
        requestDelayMs: parseInt(process.env.TRANSLATION_REQUEST_DELAY_MS, 10) || 2200,
        timeoutMs: parseInt(process.env.TRANSLATION_TIMEOUT_MS, 10) || 45000,
        retryAttempts: parseInt(process.env.TRANSLATION_RETRY_ATTEMPTS, 10) || 4,
        retryBaseDelayMs: parseInt(process.env.TRANSLATION_RETRY_BASE_DELAY_MS, 10) || 2500,
        rateLimitCooldownMs: parseInt(process.env.TRANSLATION_RATE_LIMIT_COOLDOWN_MS, 10) || 120000,
        hosts: (process.env.TRANSLATION_HOSTS || 'translate.google.com,translate.google.com.vn,translate.google.co.jp,translate.google.co.kr')
            .split(',')
            .map(host => host.trim())
            .filter(Boolean),
        azure: {
            key: process.env.AZURE_TRANSLATOR_KEY || '',
            region: process.env.AZURE_TRANSLATOR_REGION || '',
            endpoint: process.env.AZURE_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com',
        },
        batchMaxLength: parseInt(process.env.TRANSLATION_BATCH_MAX_LENGTH, 10) || 4500,
        cacheTtlMs: parseInt(process.env.TRANSLATION_CACHE_TTL_MS, 10) || 7 * 24 * 60 * 60 * 1000,
        cacheMaxItems: parseInt(process.env.TRANSLATION_CACHE_MAX_ITEMS, 10) || 1000,
    },

    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX, 10000) || 100000,
    },

    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',

    // Upload
    upload: {
        maxSize: parseInt(process.env.UPLOAD_MAX_SIZE, 10) || 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    },
};

module.exports = envVars;
