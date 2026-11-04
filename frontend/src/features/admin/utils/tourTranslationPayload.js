const TRANSLATION_FIELDS = [
  'title',
  'summary',
  'highlights',
  'price_includes',
  'price_excludes',
  'terms_and_notes',
  'cancellation_policy',
];

const isMeaningfulText = (value) =>
  String(value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim().length > 0;

export const getTourTranslationPayload = (
  translations,
  { isCreate, baseline = [] }
) => {
  if (isCreate) {
    return translations.filter((t) =>
      TRANSLATION_FIELDS.some((field) => isMeaningfulText(t?.[field]))
    );
  }

  return translations.filter((translation) => {
    const original = baseline.find((item) => item.language === translation.language) || {};
    const hasChanged = TRANSLATION_FIELDS.some(
      (field) => (translation[field] ?? '') !== (original[field] ?? '')
    );
    if (!hasChanged) return false;

    const hasAnyContent = TRANSLATION_FIELDS.some((field) =>
      isMeaningfulText(translation[field])
    );
    const hadOriginalContent = TRANSLATION_FIELDS.some((field) =>
      isMeaningfulText(original[field])
    );

    return hasAnyContent || hadOriginalContent;
  });
};
