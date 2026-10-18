import { describe, expect, it } from 'vitest';
import { getTourTranslationPayload } from '@/features/admin/utils/tourTranslationPayload';

const translation = (language, title, summary = '') => ({
  language,
  title,
  summary,
});

describe('tour translation payload', () => {
  it('keeps both target locales in a new tour payload', () => {
    const translations = [
      translation('en', 'Da Nang Tour'),
      translation('zh', '岘港之旅'),
    ];

    expect(getTourTranslationPayload(translations, { isCreate: true })).toEqual(translations);
  });

  it('submits only the locale changed in an existing tour form', () => {
    const baseline = [
      translation('en', 'Da Nang Tour', 'Explore Da Nang.'),
      translation('zh', '岘港之旅', '探索岘港。'),
    ];
    const current = [
      translation('en', 'Da Nang Tour - reviewed', 'Explore Da Nang.'),
      translation('zh', '岘港之旅', '探索岘港。'),
    ];

    expect(getTourTranslationPayload(current, { isCreate: false, baseline })).toEqual([
      current[0],
    ]);
  });

  it('includes a newly added locale row while preserving an unchanged row by omission', () => {
    const baseline = [
      translation('en', 'Da Nang Tour'),
      translation('zh', ''),
    ];
    const current = [
      translation('en', 'Da Nang Tour'),
      translation('zh', '岘港之旅'),
    ];

    expect(getTourTranslationPayload(current, { isCreate: false, baseline })).toEqual([
      current[1],
    ]);
  });
});
