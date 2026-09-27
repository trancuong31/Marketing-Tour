const { normalizeLanguage, normalizeTargetLanguage } = require('../../src/utils/language');

describe('translation locale normalization', () => {
    it('keeps the app locale canonical as vi, en, or zh', () => {
        expect(normalizeLanguage('vi')).toBe('vi');
        expect(normalizeLanguage('en')).toBe('en');
        expect(normalizeLanguage('zh')).toBe('zh');
        expect(normalizeLanguage('zh-CN')).toBe('zh');
    });

    it('never resolves vi to en or zh in the application layer', () => {
        expect(normalizeTargetLanguage('vi')).toBe('vi');
        expect(normalizeTargetLanguage('vi')).not.toBe('en');
        expect(normalizeTargetLanguage('vi')).not.toBe('zh');
    });

    it('normalizes zh-CN to the canonical app locale zh', () => {
        expect(normalizeTargetLanguage('zh-CN')).toBe('zh');
    });
});
