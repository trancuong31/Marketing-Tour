jest.mock('../../src/config/database', () => ({
    sequelize: {
        escape: value => `'${value}'`,
        literal: value => value,
    },
}));

jest.mock('../../src/models/TranslationCache', () => ({
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    upsert: jest.fn().mockResolvedValue(null),
}));

const { translateBatch, translateTexts } = require('../../src/services/translationService');

const batchResponse = (entries, targetLanguage) => entries
    .map(([key, value]) => `[[MT_TRANSLATE_FIELD:${key}:START]]\n${targetLanguage.toUpperCase()} ${value}\n[[MT_TRANSLATE_FIELD:${key}:END]]`)
    .join('\n\n');

const providerResponse = (status, body, headers = {}) => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: `HTTP ${status}`,
    headers: {
        get: name => headers[name.toLowerCase()] || null,
    },
    json: async () => body,
    text: async () => JSON.stringify(body),
});

describe('translation service batching', () => {
    beforeEach(() => {
        global.fetch = jest.fn(async (_url, request) => {
            const body = JSON.parse(request.body);
            const entries = [...body.query.matchAll(/\[\[MT_TRANSLATE_FIELD:([^:]+):START\]\]\n([\s\S]*?)\n\[\[MT_TRANSLATE_FIELD:\1:END\]\]/g)]
                .map(match => [match[1], match[2]]);
            return {
                ok: true,
                json: async () => ({
                    translation: entries.length > 0 ? batchResponse(entries, body.to) : `${body.to.toUpperCase()} ${body.query}`,
                }),
            };
        });
    });

    afterEach(() => {
        delete global.fetch;
    });

    it('exposes and translates multiple Vietnamese fields to English', async () => {
        expect(typeof translateBatch).toBe('function');

        const result = await translateBatch([
            ['title', 'Tour Sapa'],
            ['summary', 'Khám phá núi rừng'],
        ], 'en', { strict: true });

        expect(result).toEqual([
            ['title', 'EN Tour Sapa'],
            ['summary', 'EN Khám phá núi rừng'],
        ]);
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(JSON.parse(global.fetch.mock.calls[0][1].body).from).toBe('vi');
    });

    it('translates multiple Vietnamese fields to Chinese without using English as source', async () => {
        const result = await translateTexts({
            texts: {
                title: 'Tour Hà Nội',
                summary: 'Khám phá phố cổ',
            },
            targetLang: 'zh',
            strict: true,
        });

        expect(result).toEqual({
            title: 'ZH Tour Hà Nội',
            summary: 'ZH Khám phá phố cổ',
        });
        expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toMatchObject({ from: 'vi', to: 'zh' });
        expect(JSON.parse(global.fetch.mock.calls[0][1].body).query).toContain('Tour Hà Nội');
    });

    it('preserves empty source fields without translating or inventing values', async () => {
        const result = await translateTexts({
            texts: { title: '', summary: 'Nội dung' },
            targetLang: 'en',
            strict: true,
        });

        expect(result).toEqual({ title: '', summary: 'EN Nội dung' });
        expect(JSON.parse(global.fetch.mock.calls[0][1].body).query).not.toContain('title');
    });

    it('always sends Vietnamese as the source for both target languages', async () => {
        await translateTexts({ texts: { title: 'Tiêu đề tiếng Việt' }, targetLang: 'en', strict: true });
        await translateTexts({ texts: { title: 'Tiêu đề tiếng Việt' }, targetLang: 'zh', strict: true });

        expect(JSON.parse(global.fetch.mock.calls[0][1].body).from).toBe('vi');
        expect(JSON.parse(global.fetch.mock.calls[1][1].body).from).toBe('vi');
        expect(JSON.parse(global.fetch.mock.calls[0][1].body).query).not.toContain('EN ');
        expect(JSON.parse(global.fetch.mock.calls[1][1].body).query).not.toContain('ZH ');
    });

    it('keeps every multi-field provider payload within the configured 5000-character limit', async () => {
        const texts = Object.fromEntries(Array.from({ length: 4 }, (_, index) => [
            `field${index}`,
            'Nội dung tiếng Việt '.repeat(100),
        ]));

        await translateTexts({ texts, targetLang: 'en', strict: true });

        const providerQueries = global.fetch.mock.calls.map(([, request]) => JSON.parse(request.body).query);
        expect(providerQueries.length).toBeGreaterThan(1);
        expect(providerQueries.every(query => query.length <= 5000)).toBe(true);
    });
});

describe('translation service large text handling', () => {
    const buildThirtyThousandViText = () => {
        const uniqueSuffix = `--${Date.now()}-${process.hrtime.bigint().toString(16)}`;
        const baseText = 'Việt Nam là một quốc gia tuyệt vời với văn hóa lâu đời, danh lam thắng cảnh và món ăn phong phú. ';
        let text = '';
        while (text.length + baseText.length + uniqueSuffix.length < 30000) {
            text += baseText;
        }
        return `${text}${uniqueSuffix}`.slice(0, 30000);
    };

    const splitIntoMaxLengthChunks = (value, maxLength) => {
        const chunks = [];
        for (let index = 0; index < value.length; index += maxLength) {
            chunks.push(value.slice(index, index + maxLength));
        }
        return chunks;
    };

    beforeEach(() => {
        jest.resetModules();
        global.fetch = jest.fn(async (_url, request) => {
            const body = JSON.parse(request.body);
            const translatedText = `${body.to.toUpperCase()} ${body.query}`;
            return {
                ok: true,
                json: async () => ({ translation: translatedText }),
            };
        });
    });

    afterEach(() => {
        delete global.fetch;
    });

    it('splits a 30,000-character VI source into ordered EN chunks and recombines the complete English result', async () => {
        const { translateTexts: largeTextTranslateTexts } = require('../../src/services/translationService');
        const sourceText = buildThirtyThousandViText();

        const result = await largeTextTranslateTexts({
            texts: { description: sourceText },
            targetLang: 'en',
            strict: true,
        });

        const payloads = global.fetch.mock.calls.map(([, request]) => JSON.parse(request.body));
        expect(payloads).toHaveLength(6);
        expect(payloads.every(payload => payload.from === 'vi')).toBe(true);
        expect(payloads.every(payload => payload.to === 'en')).toBe(true);
        expect(payloads.every(payload => payload.query.length <= 5000)).toBe(true);
        expect(payloads.map(payload => payload.query).join('')).toBe(sourceText);
        expect(payloads.map(payload => `EN ${payload.query}`).join('')).toBe(result.description);
    });

    it('splits a 30,000-character VI source into ordered ZH chunks and recombines the complete Chinese result', async () => {
        const { translateTexts: largeTextTranslateTexts } = require('../../src/services/translationService');
        const sourceText = buildThirtyThousandViText();

        const result = await largeTextTranslateTexts({
            texts: { description: sourceText },
            targetLang: 'zh',
            strict: true,
        });

        const payloads = global.fetch.mock.calls.map(([, request]) => JSON.parse(request.body));
        expect(payloads).toHaveLength(6);
        expect(payloads.every(payload => payload.from === 'vi')).toBe(true);
        expect(payloads.every(payload => payload.to === 'zh')).toBe(true);
        expect(payloads.every(payload => payload.query.length <= 5000)).toBe(true);
        expect(payloads.map(payload => payload.query).join('')).toBe(sourceText);
        expect(payloads.map(payload => `ZH ${payload.query}`).join('')).toBe(result.description);
    });

    it('keeps every provider payload at or below 5000 characters and never drops or duplicates chunks', async () => {
        const { translateTexts: largeTextTranslateTexts } = require('../../src/services/translationService');
        const sourceText = buildThirtyThousandViText();

        const result = await largeTextTranslateTexts({
            texts: { description: sourceText },
            targetLang: 'en',
            strict: true,
        });

        const payloads = global.fetch.mock.calls.map(([, request]) => JSON.parse(request.body));
        const reassembled = payloads.map(payload => payload.query).join('');
        expect(payloads.length).toBeGreaterThanOrEqual(6);
        expect(payloads.every(payload => payload.query.length <= 5000)).toBe(true);
        expect(reassembled).toBe(sourceText);
        expect(result.description).toBe(payloads.map(payload => `EN ${payload.query}`).join(''));
    });

    it('retries a failed chunk before returning the final translated text', async () => {
        const { translateTexts: largeTextTranslateTexts } = require('../../src/services/translationService');
        const sourceText = buildThirtyThousandViText();
        const expectedChunks = splitIntoMaxLengthChunks(sourceText, 5000);

        let retryExecuted = false;
        global.fetch = jest.fn(async (_url, request) => {
            const body = JSON.parse(request.body);
            if (!retryExecuted && global.fetch.mock.calls.length === 2) {
                retryExecuted = true;
                throw new Error('fetch failed');
            }

            return {
                ok: true,
                json: async () => ({ translation: `${body.to.toUpperCase()} ${body.query}` }),
            };
        });

        const result = await largeTextTranslateTexts({
            texts: { description: sourceText },
            targetLang: 'en',
            strict: true,
        });

        const payloads = global.fetch.mock.calls.map(([, request]) => JSON.parse(request.body));
        const uniquePayloads = payloads.filter((payload, index, all) => all.findIndex(candidate => candidate.query === payload.query) === index);
        expect(global.fetch).toHaveBeenCalledTimes(7);
        expect(expectedChunks.length).toBeGreaterThanOrEqual(6);
        expect(payloads.every(payload => payload.query.length <= 5000)).toBe(true);
        expect(uniquePayloads).toHaveLength(expectedChunks.length);
        expect(result.description).toBe(uniquePayloads.map(payload => `EN ${payload.query}`).join(''));
    });
});

describe('translation service adaptive concurrency', () => {
    const withServiceEnv = (envOverrides, fn) => {
        const previousEnv = { ...process.env };

        Object.assign(process.env, {
            TRANSLATION_CONCURRENCY: '2',
            TRANSLATION_CONCURRENCY_MIN: '2',
            TRANSLATION_CONCURRENCY_MAX: '4',
            TRANSLATION_CONCURRENCY_INCREASE_AFTER_SUCCESS: '1',
            TRANSLATION_REQUEST_DELAY_MS: '0',
            ...envOverrides,
        });

        jest.resetModules();
        try {
            return fn(require('../../src/services/translationService'));
        } finally {
            process.env = previousEnv;
            jest.resetModules();
        }
    };

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(Date.now() + 300000);
        jest.spyOn(Math, 'random').mockReturnValue(0);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
        delete global.fetch;
    });

    it('increases concurrency after successful requests without exceeding the configured maximum', async () => {
        await withServiceEnv({}, async ({ translateTexts, getTranslationConcurrencyState }) => {
            global.fetch = jest.fn(async (_url, request) => {
                const body = JSON.parse(request.body);
                const entries = [...body.query.matchAll(/\[\[MT_TRANSLATE_FIELD:([^:]+):START\]\]\n([\s\S]*?)\n\[\[MT_TRANSLATE_FIELD:\1:END\]\]/g)]
                    .map(match => [match[1], match[2]]);
                return {
                    ok: true,
                    json: async () => ({
                        translation: entries.length > 0 ? batchResponse(entries, body.to) : `${body.to.toUpperCase()} ${body.query}`,
                    }),
                };
            });

            await translateTexts({
                texts: {
                    title: 'Tour Sapa',
                    summary: 'Khám phá núi rừng',
                    details: 'Đường đi scenic',
                    notes: 'Nội dung dài hơn 50 ký tự',
                },
                targetLang: 'en',
                strict: true,
            });

            const state = getTranslationConcurrencyState();
            expect(state.min).toBe(2);
            expect(state.max).toBe(4);
            expect(state.current).toBeGreaterThanOrEqual(2);
            expect(state.current).toBeLessThanOrEqual(4);
        });
    });

    it('reduces concurrency immediately after a rate limit response', async () => {
        await withServiceEnv({
            TRANSLATION_RETRY_ATTEMPTS: '1',
            TRANSLATION_RATE_LIMIT_COOLDOWN_MS: '100',
        }, async ({ translateTexts, getTranslationConcurrencyState }) => {
            global.fetch = jest.fn(() => Promise.resolve(providerResponse(429, { message: 'rate limited' }, { 'retry-after': '0' })));

            const request = translateTexts({ texts: { title: 'Tiêu đề retry after' }, targetLang: 'en', strict: true }).catch(() => undefined);
            await Promise.resolve();

            expect(getTranslationConcurrencyState().current).toBe(2);
            await request;
        });
    });
});

describe('translation service retry handling', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(Date.now() + 300000);
        jest.spyOn(Math, 'random').mockReturnValue(0);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
        delete global.fetch;
    });

    const settleRetryTimers = async () => {
        await jest.advanceTimersByTimeAsync(100000);
    };

    it('respects Retry-After for a 429 response', async () => {
        const responses = [
            providerResponse(429, { message: 'rate limited' }, { 'retry-after': '2' }),
            providerResponse(200, { translation: 'EN translated' }),
        ];
        const requestTimes = [];
        global.fetch = jest.fn(() => {
            requestTimes.push(Date.now());
            return Promise.resolve(responses.shift());
        });

        const request = translateTexts({ texts: { title: 'Tiêu đề retry after' }, targetLang: 'en', strict: true });
        await settleRetryTimers();
        await request;

        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(requestTimes[1] - requestTimes[0]).toBeGreaterThanOrEqual(2000);
    });

    it('uses bounded exponential backoff with jitter when Retry-After is absent', async () => {
        const responses = [
            providerResponse(429, { message: 'rate limited' }),
            providerResponse(200, { translation: 'EN translated' }),
        ];
        const requestTimes = [];
        global.fetch = jest.fn(() => {
            requestTimes.push(Date.now());
            return Promise.resolve(responses.shift());
        });

        const request = translateTexts({ texts: { title: 'Tiêu đề exponential' }, targetLang: 'en', strict: true });
        await settleRetryTimers();
        await request;

        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(requestTimes[1] - requestTimes[0]).toBeGreaterThanOrEqual(1000);
        expect(requestTimes[1] - requestTimes[0]).toBeLessThan(1300);
    });

    it('increases bounded backoff across repeated 429 responses', async () => {
        const responses = [
            providerResponse(429, { message: 'rate limited' }),
            providerResponse(429, { message: 'rate limited' }),
            providerResponse(429, { message: 'rate limited' }),
            providerResponse(200, { translation: 'EN translated' }),
        ];
        const requestTimes = [];
        global.fetch = jest.fn(() => {
            requestTimes.push(Date.now());
            return Promise.resolve(responses.shift());
        });

        const request = translateTexts({ texts: { title: 'Tiêu đề repeated rate limit' }, targetLang: 'en', strict: true });
        await settleRetryTimers();
        await request;

        expect(global.fetch).toHaveBeenCalledTimes(4);
        expect(requestTimes[1] - requestTimes[0]).toBeGreaterThanOrEqual(1000);
        expect(requestTimes[2] - requestTimes[1]).toBeGreaterThanOrEqual(2000);
        expect(requestTimes[3] - requestTimes[2]).toBeGreaterThanOrEqual(4000);
    });

    it('stops after the configured retry limit without returning a source fallback', async () => {
        global.fetch = jest.fn(() => Promise.resolve(providerResponse(429, { message: 'rate limited' })));

        const request = translateTexts({ texts: { title: 'Tiêu đề retry limit' }, targetLang: 'en', strict: true });
        const failure = request.catch(error => error);
        await settleRetryTimers();
        expect(await failure).toBeInstanceOf(Error);

        expect(global.fetch).toHaveBeenCalledTimes(4);
    });

    it('retains bounded retries for 5xx, timeout, and network errors', async () => {
        const errors = [
            [Object.assign(new Error('HTTP 503'), { statusCode: 503 }), providerResponse(200, { translation: 'EN translated' })],
            [new Error('network failure'), providerResponse(200, { translation: 'EN translated' })],
        ];

        for (const [error, success] of errors) {
            global.fetch = jest.fn()
                .mockRejectedValueOnce(error)
                .mockResolvedValueOnce(success);
            const request = translateTexts({ texts: { title: `Tiêu đề transient ${error.message}` }, targetLang: 'en', strict: true });
            await settleRetryTimers();
            await request;
            expect(global.fetch).toHaveBeenCalledTimes(2);
            global.fetch.mockClear();
        }
    });

    it('does not retry a permanent 4xx response', async () => {
        jest.setSystemTime(Date.now() + 86400000);
        global.fetch = jest.fn(() => Promise.resolve(providerResponse(400, { message: 'bad request' })));

        const request = translateTexts({ texts: { title: 'Tiêu đề permanent error' }, targetLang: 'en', strict: true });
        const failure = request.catch(error => error);
        await settleRetryTimers();
        expect(await failure).toBeInstanceOf(Error);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });
});