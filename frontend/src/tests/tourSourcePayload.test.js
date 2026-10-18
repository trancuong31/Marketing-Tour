import { describe, expect, it } from 'vitest';
import { getTourSourcePayload, ROOT_CONTENT_FIELDS } from '@/features/admin/utils/tourSourcePayload';

describe('tour source payload', () => {
    const initialValues = Object.fromEntries(ROOT_CONTENT_FIELDS.map((field) => [field, `VI ${field}`]));

    it('omits unchanged Vietnamese source fields from translation-only updates', () => {
        expect(getTourSourcePayload(initialValues, {
            isCreate: false,
            baseline: initialValues,
        })).toEqual({});
    });

    it('sends only source fields actually changed during an edit', () => {
        expect(getTourSourcePayload({
            ...initialValues,
            price_includes: 'Nội dung VI đã cập nhật.',
        }, {
            isCreate: false,
            baseline: initialValues,
        })).toEqual({ price_includes: 'Nội dung VI đã cập nhật.' });
    });

    it('preserves an explicit empty value when an admin clears a source field', () => {
        expect(getTourSourcePayload({
            ...initialValues,
            price_excludes: '',
        }, {
            isCreate: false,
            baseline: initialValues,
        })).toEqual({ price_excludes: '' });
    });

    it('includes provided source fields when creating a tour', () => {
        const createValues = { ...initialValues, summary: '' };
        const expected = { ...initialValues };
        delete expected.summary;
        expect(getTourSourcePayload(createValues, { isCreate: true })).toEqual(expected);
    });
});
