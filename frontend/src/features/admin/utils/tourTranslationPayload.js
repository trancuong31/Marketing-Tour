const TRANSLATION_FIELDS = [
  'title',
  'slug',
  'summary',
  'highlights',
  'price_includes',
  'price_excludes',
  'terms_and_notes',
  'cancellation_policy',
];

export const getTourTranslationPayload = (
  translations,
  { isCreate, baseline = [] }
) => {
  if (isCreate) return translations;

  return translations.filter((translation) => {
    const original = baseline.find((item) => item.language === translation.language) || {};
    return TRANSLATION_FIELDS.some(
      (field) => (translation[field] ?? '') !== (original[field] ?? '')
    );
  });
};
