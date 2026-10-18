export const ROOT_CONTENT_FIELDS = [
  'title',
  'summary',
  'highlights',
  'price_includes',
  'price_excludes',
  'terms_and_notes',
  'cancellation_policy',
];

export const getTourSourcePayload = (values, { isCreate, baseline = {} }) => {
  const sourcePayload = {};

  for (const field of ROOT_CONTENT_FIELDS) {
    const value = values[field] ?? '';
    if (isCreate) {
      if (value !== '') sourcePayload[field] = value;
      continue;
    }

    if (value !== (baseline[field] ?? '')) {
      sourcePayload[field] = value;
    }
  }

  return sourcePayload;
};
