const crypto = require('crypto');
const { translate } = require('@vitalets/google-translate-api');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');
const logger = require('../config/logger');
const env = require('../config/env');

const MAX_FIELDS = 80;
const MAX_FIELD_LENGTH = 12000;
const TRANSLATION_CONCURRENCY = Math.max(1, env.translation.concurrency);
const TRANSLATION_REQUEST_DELAY_MS = Math.max(0, env.translation.requestDelayMs);
const TRANSLATION_TIMEOUT_MS = Math.max(1000, env.translation.timeoutMs);
const TRANSLATION_RETRY_ATTEMPTS = Math.max(1, env.translation.retryAttempts);
const TRANSLATION_RETRY_BASE_DELAY_MS = Math.max(0, env.translation.retryBaseDelayMs);
const TRANSLATION_BATCH_MAX_LENGTH = Math.max(500, env.translation.batchMaxLength);
const TRANSLATION_CACHE_TTL_MS = Math.max(0, env.translation.cacheTtlMs);
const TRANSLATION_CACHE_MAX_ITEMS = Math.max(0, env.translation.cacheMaxItems);
const FIELD_NAME_PATTERN = /^[a-zA-Z0-9_.-]+$/;
const BATCH_MARKER_PREFIX = 'MT_TRANSLATE_FIELD';

const translationCache = new Map();
const pendingTranslationRequests = [];
let activeTranslationRequests = 0;
let nextAllowedRequestAt = 0;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const hashText = (value) => crypto
    .createHash('sha256')
    .update(value, 'utf8')
    .digest('hex');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getCacheKey = (targetLanguage, value) => `${targetLanguage}:${hashText(value)}`;

const getCachedTranslation = (targetLanguage, value) => {
    if (!TRANSLATION_CACHE_TTL_MS || !TRANSLATION_CACHE_MAX_ITEMS) return null;

    const cached = translationCache.get(getCacheKey(targetLanguage, value));
    if (!cached) return null;

    if (Date.now() - cached.createdAt > TRANSLATION_CACHE_TTL_MS) {
        translationCache.delete(getCacheKey(targetLanguage, value));
        return null;
    }

    return cached.text;
};

const setCachedTranslation = (targetLanguage, value, text) => {
    if (!TRANSLATION_CACHE_TTL_MS || !TRANSLATION_CACHE_MAX_ITEMS) return;

    while (translationCache.size >= TRANSLATION_CACHE_MAX_ITEMS) {
        translationCache.delete(translationCache.keys().next().value);
    }

    translationCache.set(getCacheKey(targetLanguage, value), {
        text,
        createdAt: Date.now(),
    });
};

const acquireTranslationSlot = () => new Promise((resolve) => {
    if (activeTranslationRequests < TRANSLATION_CONCURRENCY) {
        activeTranslationRequests += 1;
        resolve();
        return;
    }

    pendingTranslationRequests.push(resolve);
});

const releaseTranslationSlot = () => {
    activeTranslationRequests -= 1;
    const next = pendingTranslationRequests.shift();
    if (next) {
        activeTranslationRequests += 1;
        next();
    }
};

const withTimeout = (promise, timeoutMs, message) => {
    let timeoutId;

    const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
    });

    return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
};

const enqueueTranslationRequest = async (task) => {
    await acquireTranslationSlot();

    try {
        const delayMs = Math.max(0, nextAllowedRequestAt - Date.now());
        if (delayMs) {
            await wait(delayMs);
        }

        nextAllowedRequestAt = Date.now() + TRANSLATION_REQUEST_DELAY_MS;
        return await withTimeout(
            task(),
            TRANSLATION_TIMEOUT_MS,
            `Translate request timed out after ${TRANSLATION_TIMEOUT_MS}ms`,
        );
    } finally {
        releaseTranslationSlot();
    }
};

const getErrorStatusCode = (error) => Number(
    error?.statusCode ||
    error?.status ||
    error?.response?.status ||
    error?.response?.statusCode,
);

const isRateLimitError = (error) => {
    const message = String(error?.message || '').toLowerCase();
    return getErrorStatusCode(error) === HTTP_CODES.TOO_MANY_REQUESTS ||
        message.includes('too many requests') ||
        message.includes('rate limit');
};

const isTransientTranslationError = (error) => {
    const statusCode = getErrorStatusCode(error);
    const message = String(error?.message || '').toLowerCase();
    return isRateLimitError(error) ||
        message.includes('timed out') ||
        message.includes('timeout') ||
        [408, 425, 500, 502, 503, 504].includes(statusCode);
};

const getRetryDelay = (attempt) => {
    const backoff = TRANSLATION_RETRY_BASE_DELAY_MS * (2 ** (attempt - 1));
    const jitter = Math.floor(Math.random() * 300);
    return backoff + jitter;
};

const translateWithRetry = async (value, targetLanguage) => {
    let lastError;

    for (let attempt = 1; attempt <= TRANSLATION_RETRY_ATTEMPTS; attempt += 1) {
        try {
            return await enqueueTranslationRequest(() => translate(value, { from: 'vi', to: targetLanguage }));
        } catch (error) {
            lastError = error;
            if (attempt >= TRANSLATION_RETRY_ATTEMPTS || !isTransientTranslationError(error)) {
                throw error;
            }
            await wait(getRetryDelay(attempt));
        }
    }

    throw lastError;
};

const createBatchText = (entries) => entries
    .map(([key, value]) => `[[${BATCH_MARKER_PREFIX}:${key}:START]]\n${value}\n[[${BATCH_MARKER_PREFIX}:${key}:END]]`)
    .join('\n\n');

const parseBatchTranslation = (translatedText, entries) => {
    const parsed = [];

    for (const [key] of entries) {
        const escapedKey = escapeRegExp(key);
        const pattern = new RegExp(
            `\\[\\[${BATCH_MARKER_PREFIX}:${escapedKey}:START\\]\\]\\s*([\\s\\S]*?)\\s*\\[\\[${BATCH_MARKER_PREFIX}:${escapedKey}:END\\]\\]`,
        );
        const match = translatedText.match(pattern);
        if (!match) return null;
        parsed.push([key, match[1].trim()]);
    }

    return parsed;
};

const splitEntriesIntoBatches = (entries) => {
    const batches = [];
    let currentBatch = [];
    let currentLength = 0;

    for (const entry of entries) {
        const fieldLength = createBatchText([entry]).length;
        if (currentBatch.length > 0 && currentLength + fieldLength > TRANSLATION_BATCH_MAX_LENGTH) {
            batches.push(currentBatch);
            currentBatch = [];
            currentLength = 0;
        }

        currentBatch.push(entry);
        currentLength += fieldLength;
    }

    if (currentBatch.length > 0) {
        batches.push(currentBatch);
    }

    return batches;
};

const translateBatch = async (entries, targetLanguage, options = {}) => {
    const batchText = createBatchText(entries);
    const result = await translateWithRetry(batchText, targetLanguage);
    const parsedEntries = parseBatchTranslation(result.text, entries);

    if (!parsedEntries) {
        logger.warn('Batch translate markers were not preserved; falling back to field-by-field translation.');
        return Promise.all(entries.map(entry => translateTextEntry(entry, targetLanguage, options)));
    }

    parsedEntries.forEach(([key, translatedText]) => {
        const sourceText = entries.find(([entryKey]) => entryKey === key)?.[1];
        if (sourceText) {
            setCachedTranslation(targetLanguage, sourceText, translatedText);
        }
    });

    return parsedEntries;
};

const normalizeTargetLanguage = (language) => {
    if (!language || typeof language !== 'string') return null;

    const normalized = language.trim().toLowerCase();
    if (normalized.startsWith('vi')) return 'vi';
    if (normalized.startsWith('en')) return 'en';
    if (normalized.startsWith('zh')) return 'zh-CN';

    return null;
};

const validateTexts = (texts) => {
    if (!texts || Array.isArray(texts) || typeof texts !== 'object') {
        throw new AppError('Dữ liệu văn bản không hợp lệ', HTTP_CODES.BAD_REQUEST);
    }

    const entries = Object.entries(texts);
    if (entries.length === 0 || entries.length > MAX_FIELDS) {
        throw new AppError(`Chỉ được dịch từ 1 đến ${MAX_FIELDS} trường mỗi lần`, HTTP_CODES.BAD_REQUEST);
    }

    return entries.map(([key, value]) => {
        if (!FIELD_NAME_PATTERN.test(key)) {
            throw new AppError('Tên trường dịch không hợp lệ', HTTP_CODES.BAD_REQUEST);
        }

        const text = typeof value === 'string' ? value.trim() : '';
        if (text.length > MAX_FIELD_LENGTH) {
            throw new AppError(`Nội dung trường "${key}" vượt quá giới hạn`, HTTP_CODES.BAD_REQUEST);
        }

        return [key, text];
    });
};

const translateTextEntry = async ([key, value], targetLanguage, { strict = false } = {}) => {
    if (!value) return [key, ''];

    const cachedText = getCachedTranslation(targetLanguage, value);
    if (cachedText) return [key, cachedText];

    try {
        const result = await translateWithRetry(value, targetLanguage);
        setCachedTranslation(targetLanguage, value, result.text);
        return [key, result.text];
    } catch (error) {
        logger.warn(`Translate failed for field "${key}": ${error.message}`);
        if (strict) {
            const statusCode = isRateLimitError(error) ? HTTP_CODES.TOO_MANY_REQUESTS : HTTP_CODES.BAD_GATEWAY;
            const message = isRateLimitError(error)
                ? `Dịch vụ dịch đang bị giới hạn. Vui lòng đợi vài phút rồi thử lại trường "${key}".`
                : `Không dịch được trường "${key}". Vui lòng thử lại.`;
            throw new AppError(message, statusCode);
        }
        return [key, value];
    }
};

const translateEntries = async (entries, targetLanguage, options = {}) => {
    const translatedMap = new Map();
    const uncachedEntries = [];

    entries.forEach(([key, value]) => {
        if (!value) {
            translatedMap.set(key, '');
            return;
        }

        const cachedText = getCachedTranslation(targetLanguage, value);
        if (cachedText) {
            translatedMap.set(key, cachedText);
            return;
        }

        uncachedEntries.push([key, value]);
    });

    const batches = splitEntriesIntoBatches(uncachedEntries);
    for (let index = 0; index < batches.length; index += TRANSLATION_CONCURRENCY) {
        const chunk = batches.slice(index, index + TRANSLATION_CONCURRENCY);
        const translatedChunks = await Promise.all(chunk.map(async (batch) => {
            try {
                return batch.length === 1
                    ? [await translateTextEntry(batch[0], targetLanguage, options)]
                    : await translateBatch(batch, targetLanguage, options);
            } catch (error) {
                const failedKey = batch[0]?.[0] || '';
                logger.warn(`Translate failed for batch starting at field "${failedKey}": ${error.message}`);
                if (options.strict) {
                    const statusCode = isRateLimitError(error) ? HTTP_CODES.TOO_MANY_REQUESTS : HTTP_CODES.BAD_GATEWAY;
                    const message = isRateLimitError(error)
                        ? `Dịch vụ dịch đang bị giới hạn. Vui lòng đợi vài phút rồi thử lại trường "${failedKey}".`
                        : `Không dịch được trường "${failedKey}". Vui lòng thử lại.`;
                    throw new AppError(message, statusCode);
                }
                return batch;
            }
        }));

        translatedChunks.flat().forEach(([key, translatedText]) => {
            translatedMap.set(key, translatedText);
        });
    }

    return entries.map(([key]) => [key, translatedMap.get(key) || '']);
};

const translateTexts = async ({ texts, targetLang, strict = false }) => {
    const targetLanguage = normalizeTargetLanguage(targetLang);
    if (!targetLanguage) {
        throw new AppError('Ngôn ngữ đích không hợp lệ', HTTP_CODES.BAD_REQUEST);
    }

    const entries = validateTexts(texts);
    if (targetLanguage === 'vi') {
        return Object.fromEntries(entries);
    }

    return Object.fromEntries(await translateEntries(entries, targetLanguage, { strict }));
};

module.exports = {
    translateTexts,
};
