const crypto = require('crypto');
const { translate } = require('@vitalets/google-translate-api');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');
const logger = require('../config/logger');
const env = require('../config/env');
const TranslationCache = require('../models/TranslationCache');

const MAX_FIELDS = 80;
const MAX_FIELD_LENGTH = 100000;
const TRANSLATION_PROVIDER = env.translation.provider;
const TRANSLATION_CONCURRENCY = Math.max(1, env.translation.concurrency);
const TRANSLATION_REQUEST_DELAY_MS = Math.max(0, env.translation.requestDelayMs);
const TRANSLATION_TIMEOUT_MS = Math.max(1000, env.translation.timeoutMs);
const TRANSLATION_RETRY_ATTEMPTS = Math.max(1, env.translation.retryAttempts);
const TRANSLATION_RETRY_BASE_DELAY_MS = Math.max(0, env.translation.retryBaseDelayMs);
const TRANSLATION_RATE_LIMIT_COOLDOWN_MS = Math.max(0, env.translation.rateLimitCooldownMs);
const TRANSLATION_BATCH_MAX_LENGTH = Math.max(500, env.translation.batchMaxLength);
const TRANSLATION_CACHE_TTL_MS = Math.max(0, env.translation.cacheTtlMs);
const TRANSLATION_CACHE_MAX_ITEMS = Math.max(0, env.translation.cacheMaxItems);
const TRANSLATION_HOSTS = Array.isArray(env.translation.hosts) && env.translation.hosts.length > 0
    ? env.translation.hosts
    : ['translate.google.com'];
const AZURE_TRANSLATOR_ENDPOINT = String(env.translation.azure?.endpoint || 'https://api.cognitive.microsofttranslator.com').replace(/\/+$/, '');
const AZURE_TRANSLATOR_KEY = env.translation.azure?.key || '';
const AZURE_TRANSLATOR_REGION = env.translation.azure?.region || '';
const FIELD_NAME_PATTERN = /^[a-zA-Z0-9_.-]+$/;
const BATCH_MARKER_PREFIX = 'MT_TRANSLATE_FIELD';
const LONG_TEXT_CHUNK_MAX_LENGTH = Math.max(500, Math.min(TRANSLATION_BATCH_MAX_LENGTH, 2500));

const translationCache = new Map();
const pendingTranslationRequests = [];
let activeTranslationRequests = 0;
let nextAllowedRequestAt = 0;
const translationHostCooldowns = new Map();

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const hashText = (value) => crypto
    .createHash('sha256')
    .update(value, 'utf8')
    .digest('hex');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getCacheKey = (targetLanguage, value) => `${TRANSLATION_PROVIDER}:${targetLanguage}:${hashText(value)}`;

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

const getPersistentCachedTranslation = async (targetLanguage, value) => {
    const cachedText = getCachedTranslation(targetLanguage, value);
    if (cachedText) return cachedText;

    try {
        const cached = await TranslationCache.findOne({
            where: {
                source_hash: hashText(value),
                source_language: 'vi',
                target_language: normalizeTargetLanguage(targetLanguage) || targetLanguage,
                provider: TRANSLATION_PROVIDER,
            },
            attributes: ['translated_text'],
        });

        if (!cached?.translated_text) return null;
        setCachedTranslation(targetLanguage, value, cached.translated_text);
        return cached.translated_text;
    } catch (error) {
        logger.warn(`Translation cache lookup failed: ${error.message}`);
        return null;
    }
};

const setPersistentCachedTranslation = async (targetLanguage, value, translatedText) => {
    setCachedTranslation(targetLanguage, value, translatedText);

    try {
        await TranslationCache.upsert({
            source_hash: hashText(value),
            source_language: 'vi',
            target_language: normalizeTargetLanguage(targetLanguage) || targetLanguage,
            provider: TRANSLATION_PROVIDER,
            source_text: value,
            translated_text: translatedText,
        });
    } catch (error) {
        logger.warn(`Translation cache save failed: ${error.message}`);
    }
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

const getTranslationHostCooldownUntil = (host) => translationHostCooldowns.get(host) || 0;

const enqueueTranslationRequest = async (task, host) => {
    await acquireTranslationSlot();

    try {
        const delayMs = Math.max(
            0,
            nextAllowedRequestAt - Date.now(),
            host ? getTranslationHostCooldownUntil(host) - Date.now() : 0,
        );
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

const getAzureTargetLanguage = (targetLanguage) => (
    targetLanguage === 'zh-CN' ? 'zh-Hans' : targetLanguage
);

const hasHtmlMarkup = (value) => /<\/?[a-z][\s\S]*>/i.test(value);

const buildTranslationHttpError = async (response, providerName) => {
    let details = '';

    try {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const data = await response.json();
            details = data?.error?.message || data?.message || JSON.stringify(data);
        } else {
            details = await response.text();
        }
    } catch (_) {
        details = response.statusText;
    }

    const error = new Error(`${providerName} translate failed: ${details || response.statusText}`);
    error.statusCode = response.status;
    return error;
};

const translateWithAzure = async (value, targetLanguage) => {
    if (!AZURE_TRANSLATOR_KEY) {
        throw new AppError(
            'Chưa cấu hình Azure Translator. Vui lòng thêm AZURE_TRANSLATOR_KEY vào backend/.env.',
            HTTP_CODES.BAD_REQUEST,
        );
    }

    const params = new URLSearchParams({
        'api-version': '3.0',
        from: 'vi',
        to: getAzureTargetLanguage(targetLanguage),
    });

    if (hasHtmlMarkup(value)) {
        params.set('textType', 'html');
    }

    const headers = {
        'Ocp-Apim-Subscription-Key': AZURE_TRANSLATOR_KEY,
        'Content-Type': 'application/json',
        'X-ClientTraceId': crypto.randomUUID(),
    };

    if (AZURE_TRANSLATOR_REGION) {
        headers['Ocp-Apim-Subscription-Region'] = AZURE_TRANSLATOR_REGION;
    }

    const response = await fetch(`${AZURE_TRANSLATOR_ENDPOINT}/translate?${params.toString()}`, {
        method: 'POST',
        headers,
        body: JSON.stringify([{ Text: value }]),
    });

    if (!response.ok) {
        throw await buildTranslationHttpError(response, 'Azure');
    }

    const data = await response.json();
    const translatedText = data?.[0]?.translations?.[0]?.text;
    if (typeof translatedText !== 'string') {
        throw new Error('Azure translate response is missing translated text.');
    }

    return { text: translatedText };
};

const applyTranslationRateLimitCooldown = (host) => {
    if (!TRANSLATION_RATE_LIMIT_COOLDOWN_MS) return;
    const cooldownUntil = Date.now() + TRANSLATION_RATE_LIMIT_COOLDOWN_MS;

    if (host) {
        translationHostCooldowns.set(host, Math.max(getTranslationHostCooldownUntil(host), cooldownUntil));
    }
};

const getRetryDelay = (attempt, error) => {
    if (isRateLimitError(error) && TRANSLATION_RATE_LIMIT_COOLDOWN_MS) {
        return TRANSLATION_RATE_LIMIT_COOLDOWN_MS + Math.floor(Math.random() * 1000);
    }

    const backoff = TRANSLATION_RETRY_BASE_DELAY_MS * (2 ** (attempt - 1));
    const jitter = Math.floor(Math.random() * 300);
    return backoff + jitter;
};

const getTranslationHostsByAvailability = () => (
    [...TRANSLATION_HOSTS].sort((firstHost, secondHost) => (
        getTranslationHostCooldownUntil(firstHost) - getTranslationHostCooldownUntil(secondHost)
    ))
);

const translateWithGoogleHosts = async (value, targetLanguage) => {
    let lastError;

    for (let attempt = 1; attempt <= TRANSLATION_RETRY_ATTEMPTS; attempt += 1) {
        const hosts = getTranslationHostsByAvailability();

        for (const host of hosts) {
            try {
                return await enqueueTranslationRequest(
                    () => translate(value, { from: 'vi', to: targetLanguage, host }),
                    host,
                );
            } catch (error) {
                lastError = error;
                if (isRateLimitError(error)) {
                    applyTranslationRateLimitCooldown(host);
                    logger.warn(`Translate host "${host}" is rate limited. Trying another host when available.`);
                    continue;
                }
                break;
            }
        }

        if (attempt >= TRANSLATION_RETRY_ATTEMPTS || !isTransientTranslationError(lastError)) {
            throw lastError;
        }

        await wait(getRetryDelay(attempt, lastError));
    }

    throw lastError;
};

const translateWithAzureRetry = async (value, targetLanguage) => {
    let lastError;

    for (let attempt = 1; attempt <= TRANSLATION_RETRY_ATTEMPTS; attempt += 1) {
        try {
            return await enqueueTranslationRequest(
                () => translateWithAzure(value, targetLanguage),
                'azure',
            );
        } catch (error) {
            lastError = error;
            if (isRateLimitError(error)) {
                applyTranslationRateLimitCooldown('azure');
            }

            if (attempt >= TRANSLATION_RETRY_ATTEMPTS || !isTransientTranslationError(error)) {
                throw error;
            }

            await wait(getRetryDelay(attempt, error));
        }
    }

    throw lastError;
};

const translateWithRetry = async (value, targetLanguage) => {
    if (TRANSLATION_PROVIDER === 'azure') {
        return translateWithAzureRetry(value, targetLanguage);
    }

    return translateWithGoogleHosts(value, targetLanguage);
};

const splitOversizedSegment = (segment, maxLength) => {
    const chunks = [];
    let remaining = segment;

    while (remaining.length > maxLength) {
        const searchWindow = remaining.slice(0, maxLength);
        const softBreaks = [
            searchWindow.lastIndexOf('</p>') + 4,
            searchWindow.lastIndexOf('</li>') + 5,
            searchWindow.lastIndexOf('</div>') + 6,
            searchWindow.lastIndexOf('<br>') + 4,
            searchWindow.lastIndexOf('<br/>') + 5,
            searchWindow.lastIndexOf('<br />') + 6,
            searchWindow.lastIndexOf('\n\n') + 2,
            searchWindow.lastIndexOf('\n') + 1,
            searchWindow.lastIndexOf('. ') + 2,
            searchWindow.lastIndexOf('。') + 1,
            searchWindow.lastIndexOf(' ') + 1,
        ].filter(index => index > Math.floor(maxLength * 0.45));

        const cutAt = softBreaks.length > 0 ? Math.max(...softBreaks) : maxLength;
        chunks.push(remaining.slice(0, cutAt));
        remaining = remaining.slice(cutAt);
    }

    if (remaining) chunks.push(remaining);
    return chunks;
};

const splitLongText = (value, maxLength = LONG_TEXT_CHUNK_MAX_LENGTH) => {
    if (value.length <= maxLength) return [value];

    const segments = [];
    const boundaryPattern = /<\/p>|<\/li>|<\/div>|<br\s*\/?>|\r?\n\r?\n|\r?\n/gi;
    let lastIndex = 0;
    let match;

    while ((match = boundaryPattern.exec(value)) !== null) {
        const endIndex = match.index + match[0].length;
        segments.push(value.slice(lastIndex, endIndex));
        lastIndex = endIndex;
    }

    if (lastIndex < value.length) {
        segments.push(value.slice(lastIndex));
    }

    const chunks = [];
    let currentChunk = '';

    const pushCurrentChunk = () => {
        if (!currentChunk) return;
        chunks.push(currentChunk);
        currentChunk = '';
    };

    segments.forEach((segment) => {
        if (!segment) return;

        if (segment.length > maxLength) {
            pushCurrentChunk();
            chunks.push(...splitOversizedSegment(segment, maxLength));
            return;
        }

        if (currentChunk && currentChunk.length + segment.length > maxLength) {
            pushCurrentChunk();
        }

        currentChunk += segment;
    });

    pushCurrentChunk();
    return chunks.filter(Boolean);
};

const getTextBoundary = (value, boundary) => value.match(boundary)?.[0] || '';

const restoreTextBoundary = (sourceText, translatedText) => {
    const leading = getTextBoundary(sourceText, /^\s+/);
    const trailing = getTextBoundary(sourceText, /\s+$/);
    return `${leading}${String(translatedText || '').trim()}${trailing}`;
};

const normalizeVisibleTextNode = (value) => String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isProbablyNonTranslatableText = (value) => {
    const text = normalizeVisibleTextNode(value);
    if (!text) return true;
    if (/^(https?:\/\/|www\.)\S+$/i.test(text)) return true;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return true;
    if (/^[\d\s.,:/+\-–—()%₫$€¥]+$/.test(text)) return true;
    return !/\p{L}/u.test(text);
};

const splitHtmlTokens = (value) => {
    const tokens = [];
    const tagPattern = /<[^>]*>/g;
    let lastIndex = 0;
    let match;

    while ((match = tagPattern.exec(value)) !== null) {
        if (match.index > lastIndex) {
            tokens.push({ type: 'text', value: value.slice(lastIndex, match.index) });
        }

        tokens.push({ type: 'tag', value: match[0] });
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < value.length) {
        tokens.push({ type: 'text', value: value.slice(lastIndex) });
    }

    return tokens;
};

const translatePlainTextValue = async (value, targetLanguage) => {
    const cachedText = await getPersistentCachedTranslation(targetLanguage, value);
    if (cachedText) return cachedText;

    if (value.length <= LONG_TEXT_CHUNK_MAX_LENGTH) {
        const result = await translateWithRetry(value, targetLanguage);
        await setPersistentCachedTranslation(targetLanguage, value, result.text);
        return result.text;
    }

    const chunks = splitLongText(value);
    logger.info(`Translating long text in ${chunks.length} chunks (${value.length} chars).`);

    const translatedChunks = [];
    for (const chunk of chunks) {
        const cachedChunk = await getPersistentCachedTranslation(targetLanguage, chunk);
        if (cachedChunk) {
            translatedChunks.push(cachedChunk);
            continue;
        }

        const result = await translateWithRetry(chunk, targetLanguage);
        await setPersistentCachedTranslation(targetLanguage, chunk, result.text);
        translatedChunks.push(result.text);
    }

    const translatedText = translatedChunks.join('');
    await setPersistentCachedTranslation(targetLanguage, value, translatedText);
    return translatedText;
};

const translateHtmlTextNodes = async (value, targetLanguage) => {
    const cachedText = await getPersistentCachedTranslation(targetLanguage, value);
    if (cachedText) return cachedText;

    const tokens = splitHtmlTokens(value);
    let translatedTextNodeCount = 0;

    const translatedTokens = [];
    for (const token of tokens) {
        if (token.type !== 'text' || isProbablyNonTranslatableText(token.value)) {
            translatedTokens.push(token.value);
            continue;
        }

        const translatedText = await translatePlainTextValue(token.value, targetLanguage);
        translatedTokens.push(restoreTextBoundary(token.value, translatedText));
        translatedTextNodeCount += 1;
    }

    const translatedHtml = translatedTokens.join('');
    await setPersistentCachedTranslation(targetLanguage, value, translatedHtml);
    logger.info(`Translated ${translatedTextNodeCount} HTML text nodes; skipped HTML tags/attributes.`);
    return translatedHtml;
};

const translateTextValue = async (value, targetLanguage) => {
    if (hasHtmlMarkup(value)) {
        return translateHtmlTextNodes(value, targetLanguage);
    }

    return translatePlainTextValue(value, targetLanguage);
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
            throw new AppError(`Nội dung trường "${key}" vượt quá giới hạn ${MAX_FIELD_LENGTH} ký tự`, HTTP_CODES.BAD_REQUEST);
        }

        return [key, text];
    });
};
const translateTextEntry = async ([key, value], targetLanguage, { strict = false } = {}) => {
    if (!value) return [key, ''];

    const cachedText = await getPersistentCachedTranslation(targetLanguage, value);
    if (cachedText) return [key, cachedText];

    try {
        const translatedText = await translateTextValue(value, targetLanguage);
        await setPersistentCachedTranslation(targetLanguage, value, translatedText);
        return [key, translatedText];
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

    for (const [key, value] of entries) {
        if (!value) {
            translatedMap.set(key, '');
            continue;
        }

        const cachedText = await getPersistentCachedTranslation(targetLanguage, value);
        if (cachedText) {
            translatedMap.set(key, cachedText);
            continue;
        }

        uncachedEntries.push([key, value]);
    }

    const batches = TRANSLATION_PROVIDER === 'azure'
        ? uncachedEntries.map(entry => [entry])
        : splitEntriesIntoBatches(uncachedEntries);
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
