const { normalizeTargetLanguage } = require('./language');

const TOUR_CONTENT_FIELDS = [
  'title',
  'summary',
  'highlights',
  'price_includes',
  'price_excludes',
  'terms_and_notes',
  'cancellation_policy',
];

const VIETNAMESE_DIACRITICS = /[\u00C0-\u024F\u1E00-\u1EFF]/u;
const HAN_CHARACTERS = /\p{Script=Han}/u;
const ENGLISH_MARKERS = new Set([
  'according',
  'and',
  'by',
  'excluding',
  'includes',
  'included',
  'for',
  'from',
  'including',
  'in',
  'of',
  'the',
  'with',
  'without',
]);
const ENGLISH_CONTENT_WORDS = new Set([
  'accommodation',
  'airline',
  'airport',
  'baggage',
  'breakfast',
  'bus',
  'cars',
  'cancellation',
  'car',
  'city',
  'coastal',
  'dinner',
  'discover',
  'enjoy',
  'expense',
  'expenses',
  'fee',
  'fees',
  'flight',
  'guide',
  'hotel',
  'insurance',
  'lunch',
  'meal',
  'meals',
  'morning',
  'personal',
  'program',
  'round',
  'service',
  'tax',
  'taxes',
  'ticket',
  'tickets',
  'tour',
  'transportation',
  'transfer',
  'trip',
  'vehicle',
  'visit',
  'evening',
  'explore',
  'departure',
]);
const VIETNAMESE_MARKERS = new Set([
  'bao',
  'bay',
  'bằng',
  'các',
  'cho',
  'chi',
  'của',
  'được',
  'gồm',
  'hành',
  'khách',
  'không',
  'khi',
  'liên',
  'lịch',
  'máy',
  'ngày',
  'nghỉ',
  'nhân',
  'phí',
  'theo',
  'thăm',
  'trình',
  'từ',
  'và',
  'vé',
  'đêm',
]);
const CLEAR_ENGLISH_PHRASE = /\b(?:according to|airline tickets?|airport transfers?|entrance fees?|flight tickets?|hotel accommodation|not included|personal expenses|round[-\s]trip|subject to|travel insurance)\b/i;

const plainText = (value) => String(value ?? '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;|&#160;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/\s+/g, ' ')
  .trim();

const hasClearEnglishSignals = (value) => {
  const text = plainText(value).toLowerCase();
  if (!text) return false;
  if (CLEAR_ENGLISH_PHRASE.test(text)) return true;

  const words = text.match(/[a-z]+/g) || [];
  const uniqueWords = new Set(words);
  const markerCount = [...uniqueWords].filter((word) => ENGLISH_MARKERS.has(word)).length;
  const contentWordCount = [...uniqueWords].filter((word) => ENGLISH_CONTENT_WORDS.has(word)).length;

  return (markerCount >= 1 && markerCount + contentWordCount >= 3) || contentWordCount >= 3;
};

const hasClearVietnameseSignals = (value) => {
  const words = plainText(value).toLowerCase().match(/\p{L}+/gu) || [];
  const markerCount = new Set(words.filter((word) => VIETNAMESE_MARKERS.has(word))).size;
  return markerCount >= 2;
};

const hasVietnameseEvidence = (text) =>
  hasClearVietnameseSignals(text) || VIETNAMESE_DIACRITICS.test(text);

const hasEmbeddedHanName = (text) => {
  const hanCount = (text.match(/\p{Script=Han}/gu) || []).length;
  const latinCount = (text.match(/\p{Script=Latin}/gu) || []).length;
  return hanCount > 0 && latinCount >= hanCount * 2;
};

const inspectVietnameseSource = (value) => {
  const text = plainText(value);
  if (!text) return { status: 'missing', reason: 'empty' };
  const englishSignals = hasClearEnglishSignals(text);
  const vietnameseSignals = hasClearVietnameseSignals(text);
  const vietnameseEvidence = hasVietnameseEvidence(text);
  if (HAN_CHARACTERS.test(text) && (!vietnameseEvidence || !hasEmbeddedHanName(text))) {
    return { status: 'unverified', reason: 'contains_han_characters' };
  }
  if (englishSignals && vietnameseSignals) {
    return { status: 'unverified', reason: 'mixed_language_requires_review' };
  }
  if (englishSignals) return { status: 'unverified', reason: 'likely_english' };
  if (vietnameseEvidence) {
    return { status: 'available', reason: null };
  }

  const wordCount = text.match(/\p{L}+/gu)?.length || 0;
  if (wordCount >= 4) return { status: 'unverified', reason: 'ambiguous_language' };
  return { status: 'available', reason: null };
};

const inspectTranslation = (value, language) => {
  const text = plainText(value);
  if (!text) return { status: 'missing', reason: 'empty' };

  if (language === 'en') {
    if (HAN_CHARACTERS.test(text) && (!hasClearEnglishSignals(text) || !hasEmbeddedHanName(text))) {
      return { status: 'unverified', reason: 'contains_han_characters' };
    }
    if (hasClearVietnameseSignals(text)) {
      return { status: 'unverified', reason: 'likely_vietnamese' };
    }
  }
  if (language === 'zh' && (hasClearEnglishSignals(text) || !HAN_CHARACTERS.test(text))) {
    return { status: 'unverified', reason: 'not_verifiably_chinese' };
  }

  return { status: 'available', reason: null };
};

const assertVietnameseSourceFields = (values, { requiredFields = [] } = {}) => {
  const invalid = [];

  for (const field of new Set([...Object.keys(values || {}), ...requiredFields])) {
    const value = values?.[field];
    if (value !== undefined && value !== null && typeof value !== 'string') {
      invalid.push({ field, status: 'unverified', reason: 'not_text' });
      continue;
    }
    const result = inspectVietnameseSource(value);
    if (result.status === 'available') continue;
    if (result.status === 'missing' && !requiredFields.includes(field)) continue;
    invalid.push({ field, ...result });
  }

  if (invalid.length > 0) {
    const details = invalid.map(({ field, reason }) => `${field} (${reason})`).join(', ');
    const error = new Error(`Vietnamese source content requires review: ${details}`);
    error.code = 'INVALID_VIETNAMESE_SOURCE';
    error.fields = invalid;
    throw error;
  }
};

const translateVietnameseSourceFields = async ({ texts, targetLanguage, translate }) => {
  const fields = Object.keys(texts || {});
  if (fields.length === 0) {
    throw new Error('No Vietnamese source fields were provided for translation.');
  }

  const normalizedTarget = normalizeTargetLanguage(targetLanguage);
  if (!normalizedTarget || normalizedTarget === 'vi') {
    throw new Error('Vietnamese source fields can only be translated to en or zh.');
  }

  assertVietnameseSourceFields(texts, { requiredFields: fields });
  return translate(texts, normalizedTarget);
};

const assertTranslationFields = (values, language) => {
  const invalid = [];

  for (const [field, value] of Object.entries(values || {})) {
    if (value === undefined || value === null || String(value).trim() === '') continue;
    const result = inspectTranslation(value, language);
    if (result.status !== 'available') invalid.push({ field, ...result });
  }

  if (invalid.length > 0) {
    const details = invalid.map(({ field, reason }) => `${field} (${reason})`).join(', ');
    const error = new Error(`Translation content requires review for ${language}: ${details}`);
    error.code = 'INVALID_TRANSLATION_CONTENT';
    error.fields = invalid;
    throw error;
  }
};

const resolveLocalizedFields = ({ source, translation, language, fields }) => {
  const content = {};
  const status = {};

  for (const field of fields) {
    const result = language === 'vi'
      ? inspectVietnameseSource(source?.[field])
      : inspectTranslation(translation?.[field], language);

    content[field] = result.status === 'available'
      ? (language === 'vi' ? source[field] : translation[field])
      : null;
    status[field] = result.status;
  }

  return { content, status };
};

const resolveTourContentForLocale = ({ source, translation, language }) =>
  resolveLocalizedFields({
    source,
    translation,
    language,
    fields: TOUR_CONTENT_FIELDS,
  });

module.exports = {
  TOUR_CONTENT_FIELDS,
  assertTranslationFields,
  assertVietnameseSourceFields,
  hasClearEnglishSignals,
  hasClearVietnameseSignals,
  hasVietnameseEvidence,
  inspectTranslation,
  inspectVietnameseSource,
  resolveLocalizedFields,
  resolveTourContentForLocale,
  translateVietnameseSourceFields,
};
