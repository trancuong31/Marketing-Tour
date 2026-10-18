const {
  assertTranslationFields,
  assertVietnameseSourceFields,
  inspectTranslation,
  inspectVietnameseSource,
  resolveTourContentForLocale,
  translateVietnameseSourceFields,
} = require('../../src/utils/tourLocaleContent');

describe('tour locale content safeguards', () => {
  const vietnamese = {
    title: 'Hành trình khám phá Đà Nẵng',
    summary: 'Tham quan Hội An và Bà Nà Hills.',
    highlights: '<p>Khởi hành cùng Vietnam Airlines.</p>',
    price_includes: '<p>Vé máy bay, khách sạn 4 sao và xe đưa đón.</p>',
    price_excludes: '<p>Chi phí cá nhân.</p>',
    terms_and_notes: '<p>Áp dụng theo quy định hiện hành.</p>',
    cancellation_policy: '<p>Liên hệ để được hỗ trợ.</p>',
  };

  it('keeps legitimate Vietnamese with English names, airline codes, URLs, and numbers', () => {
    expect(inspectVietnameseSource('Bay cùng Vietnam Airlines chuyến VN123, xem https://example.com.').status)
      .toBe('available');
    expect(inspectVietnameseSource('Khách sạn tại Da Nang, giá 500 USD.').status).toBe('available');
    expect(() => assertVietnameseSourceFields(vietnamese, { requiredFields: ['title'] })).not.toThrow();
  });

  it('allows a proper noun written in Han characters inside clearly Vietnamese prose', () => {
    const text = 'Tour khám phá 北京 và Thượng Hải trong hành trình mùa thu.';
    expect(inspectVietnameseSource(text)).toMatchObject({ status: 'available' });
    expect(() => assertVietnameseSourceFields({ summary: text })).not.toThrow();
  });

  it.each([
    ['English', 'Round-trip airline tickets and hotel accommodation according to the program.'],
    ['Chinese', '往返机票和酒店住宿服务'],
  ])('flags clearly non-Vietnamese %s source content', (_language, value) => {
    expect(inspectVietnameseSource(value)).toMatchObject({ status: 'unverified' });
    expect(() => assertVietnameseSourceFields({ price_includes: value })).toThrow(
      /Vietnamese source content requires review/
    );
  });

  it('distinguishes absent source from suspicious source', () => {
    expect(inspectVietnameseSource('   ')).toMatchObject({ status: 'missing', reason: 'empty' });
    expect(inspectVietnameseSource('Flight tickets and hotel service')).toMatchObject({
      status: 'unverified',
      reason: 'likely_english',
    });
  });

  it('marks longer language-ambiguous source for review but permits short names and phrases', () => {
    expect(inspectVietnameseSource('Flexible payment options for every traveler')).toMatchObject({
      status: 'unverified',
      reason: 'ambiguous_language',
    });
    expect(inspectVietnameseSource('Vietnam Airlines')).toMatchObject({ status: 'available' });
    expect(inspectVietnameseSource('https://example.com')).toMatchObject({ status: 'available' });
    expect(inspectVietnameseSource('VN123 X-Park')).toMatchObject({ status: 'available' });
    expect(() => assertVietnameseSourceFields({
      terms_and_notes: 'Flexible payment options for every traveler',
    })).toThrow(/terms_and_notes \(ambiguous_language\)/);
  });

  it('flags mixed English and Vietnamese prose for review', () => {
    expect(inspectVietnameseSource(
      'Vé máy bay round-trip airline tickets and hotel accommodation.'
    )).toMatchObject({
      status: 'unverified',
      reason: 'mixed_language_requires_review',
    });
  });

  it('rejects non-text source values with a field-specific review reason', () => {
    expect(() => assertVietnameseSourceFields({ price_includes: 123 })).toThrow(
      /price_includes \(not_text\)/
    );
  });

  it('resolves VI only from validated source fields and emits an explicit field status', () => {
    const resolved = resolveTourContentForLocale({
      source: { ...vietnamese, price_excludes: 'Meals and airline tickets included.' },
      translation: { price_excludes: '合法な中国語内容' },
      language: 'vi',
    });

    expect(resolved.content.price_includes).toBe(vietnamese.price_includes);
    expect(resolved.content.price_excludes).toBeNull();
    expect(resolved.status.price_excludes).toBe('unverified');
  });

  it.each([
    ['en', 'EN includes flight tickets and hotel accommodation.'],
    ['zh', '提供往返机票和酒店住宿。'],
  ])('resolves %s fields only from its matching translation', (language, translatedValue) => {
    const result = resolveTourContentForLocale({
      source: { ...vietnamese, price_includes: 'Nguồn tiếng Việt không được dùng.' },
      translation: { price_includes: translatedValue },
      language,
    });

    expect(result.content.price_includes).toBe(translatedValue);
    expect(result.status.price_includes).toBe('available');
  });

  it.each(['en', 'zh'])('does not fall back to source for missing/empty %s translation fields', (language) => {
    const missing = resolveTourContentForLocale({
      source: vietnamese,
      translation: undefined,
      language,
    });
    const empty = resolveTourContentForLocale({
      source: vietnamese,
      translation: { price_includes: '' },
      language,
    });

    expect(missing.content.price_includes).toBeNull();
    expect(missing.status.price_includes).toBe('missing');
    expect(empty.content.price_includes).toBeNull();
    expect(empty.status.price_includes).toBe('missing');
  });

  it('rejects Chinese text stored in an English translation row', () => {
    const result = resolveTourContentForLocale({
      source: vietnamese,
      translation: { price_includes: '往返机票和酒店住宿服务' },
      language: 'en',
    });
    expect(result.content.price_includes).toBeNull();
    expect(result.status.price_includes).toBe('unverified');
  });

  it('does not reject an English translation solely for a Han-script place name', () => {
    expect(inspectTranslation(
      'Flight tickets to 北京 with hotel accommodation included.',
      'en'
    )).toMatchObject({ status: 'available' });
  });

  it('rejects translation content that does not match its target language before persistence', () => {
    expect(() => assertTranslationFields({
      price_includes: '往返机票和酒店住宿服务',
    }, 'en')).toThrow(/price_includes \(contains_han_characters\)/);
    expect(() => assertTranslationFields({
      price_includes: 'Round-trip airline tickets and hotel accommodation.',
    }, 'zh')).toThrow(/price_includes \(not_verifiably_chinese\)/);
  });

  it('rejects clear Vietnamese text stored in an English translation row', () => {
    const result = resolveTourContentForLocale({
      source: vietnamese,
      translation: { price_includes: 'Bao gồm vé máy bay và khách sạn.' },
      language: 'en',
    });

    expect(result.content.price_includes).toBeNull();
    expect(result.status.price_includes).toBe('unverified');
  });

  it('rejects invalid sources before invoking a translation provider', async () => {
    const provider = jest.fn();

    await expect(translateVietnameseSourceFields({
      texts: { price_includes: 'Round-trip airline tickets and hotel service.' },
      targetLanguage: 'en',
      translate: provider,
    })).rejects.toThrow(/Vietnamese source content requires review/);

    expect(provider).not.toHaveBeenCalled();
  });

  it('rejects empty sources before invoking a translation provider', async () => {
    const provider = jest.fn();

    await expect(translateVietnameseSourceFields({
      texts: { price_includes: '' },
      targetLanguage: 'zh',
      translate: provider,
    })).rejects.toThrow(/Vietnamese source content requires review/);

    expect(provider).not.toHaveBeenCalled();
  });

  it('rejects unsupported or Vietnamese targets before invoking a translation provider', async () => {
    const provider = jest.fn();

    await expect(translateVietnameseSourceFields({
      texts: { title: 'Tour Đà Nẵng' },
      targetLanguage: 'fr',
      translate: provider,
    })).rejects.toThrow(/only be translated to en or zh/);
    await expect(translateVietnameseSourceFields({
      texts: { title: 'Tour Đà Nẵng' },
      targetLanguage: 'vi',
      translate: provider,
    })).rejects.toThrow(/only be translated to en or zh/);

    expect(provider).not.toHaveBeenCalled();
  });
});
