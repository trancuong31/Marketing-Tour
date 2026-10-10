const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');
const { translateTexts } = require('../src/services/translationService');

const REPORT_PATH = path.join(__dirname, '../tour_translation_audit_report.json');
const REMEDIATION_FIELDS = [
  'title',
  'summary',
  'highlights',
  'price_includes',
  'price_excludes',
  'terms_and_notes',
  'cancellation_policy',
];

const normalizeText = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const isLikelyInvalidTargetText = (value, language) => {
  const text = normalizeText(value);
  if (!text) return true;
  if (language === 'en') return /[\u3400-\u9FFF]/u.test(text);
  if (language === 'zh') return /[A-Za-z]/.test(text) && !/[\u3400-\u9FFF]/u.test(text);
  return false;
};

const getTargetStatus = (value, language) => {
  const text = normalizeText(value);
  if (!text) return 'EMPTY';
  if (isLikelyInvalidTargetText(text, language)) return 'INVALID';
  return 'VALID';
};

const getTourById = async (tourId) => {
  const [row] = await sequelize.query('SELECT * FROM tours WHERE id = ? LIMIT 1', {
    replacements: [tourId],
    type: QueryTypes.SELECT,
  });
  return row || null;
};

const getTourBySlug = async (slug) => {
  const [row] = await sequelize.query('SELECT * FROM tours WHERE slug = ? LIMIT 1', {
    replacements: [slug],
    type: QueryTypes.SELECT,
  });
  return row || null;
};

const getTranslationRow = async (tourId, language) => {
  const [row] = await sequelize.query('SELECT * FROM tour_translations WHERE tour_id = ? AND language = ? LIMIT 1', {
    replacements: [tourId, language],
    type: QueryTypes.SELECT,
  });
  return row || null;
};

const translateField = async (field, sourceValue, targetLanguage) => {
  const cleanSource = normalizeText(sourceValue);
  if (!cleanSource) return null;

  const result = await translateTexts({
    texts: { [field]: cleanSource },
    targetLang: targetLanguage,
    strict: true,
  });

  const translated = result && Object.prototype.hasOwnProperty.call(result, field) ? result[field] : null;
  if (typeof translated !== 'string') {
    throw new Error(`Translation service returned no string for ${field}/${targetLanguage}`);
  }
  const cleaned = normalizeText(translated);
  if (!cleaned) {
    throw new Error(`Translation service returned empty text for ${field}/${targetLanguage}`);
  }
  if (cleaned === cleanSource) {
    throw new Error(`Translation reused Vietnamese source for ${field}/${targetLanguage}`);
  }
  if (isLikelyInvalidTargetText(cleaned, targetLanguage)) {
    throw new Error(`Translated text for ${field}/${targetLanguage} looks invalid: ${cleaned.slice(0, 120)}`);
  }

  return cleaned;
};

const buildRowInsertValues = async (tour, targetLanguage) => {
  const translatedFields = {};
  for (const field of REMEDIATION_FIELDS) {
    const sourceValue = tour[field];
    if (sourceValue === null || sourceValue === undefined) continue;
    const cleanSource = normalizeText(sourceValue);
    if (!cleanSource) continue;
    translatedFields[field] = cleanSource;
  }

  if (!Object.keys(translatedFields).length) {
    throw new Error(`No source fields available for tour ${tour.id} ${targetLanguage}`);
  }

  const translations = await translateTexts({
    texts: translatedFields,
    targetLang: targetLanguage,
    strict: true,
  });

  const titleValue = normalizeText(translations.title || tour.title || '');
  const titleSlug = slugify(titleValue || `${tour.id}-${targetLanguage}`, {
    lower: true,
    strict: true,
    locale: 'vi',
  });

  return [
    tour.id,
    targetLanguage,
    titleValue || tour.title,
    titleSlug || `${tour.id}-${targetLanguage}`,
    normalizeText(translations.summary || '') || null,
    normalizeText(translations.highlights || '') || null,
    normalizeText(translations.price_includes || '') || null,
    normalizeText(translations.price_excludes || '') || null,
    normalizeText(translations.terms_and_notes || '') || null,
    normalizeText(translations.cancellation_policy || '') || null,
  ];
};

const createMissingTranslationRow = async (tour, targetLanguage) => {
  const rowInsertValues = await buildRowInsertValues(tour, targetLanguage);
  await sequelize.query(`
    INSERT INTO tour_translations (
      tour_id, language, title, slug, summary, highlights,
      price_includes, price_excludes, terms_and_notes, cancellation_policy
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, {
    replacements: rowInsertValues,
    type: QueryTypes.INSERT,
  });

  return getTranslationRow(tour.id, targetLanguage);
};

const ensureTargetCellIsRemediable = async (tourId, language, field) => {
  const row = await getTranslationRow(tourId, language);
  if (!row) return { row: null, status: 'MISSING' };
  const value = row[field];
  const status = getTargetStatus(value, language);
  return { row, status };
};

const updateSingleField = async (tourId, language, field, translatedValue) => {
  await sequelize.query(`UPDATE tour_translations SET \`${field}\` = ? WHERE tour_id = ? AND language = ?`, {
    replacements: [translatedValue, tourId, language],
    type: QueryTypes.UPDATE,
  });
};

const main = async () => {
  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
  const remediations = (report.audit || []).filter((entry) => ['MISSING', 'EMPTY', 'INVALID'].includes(entry.status));

  const execution = {
    originalAudit: {
      VALID: 64,
      MISSING: 112,
      INVALID: 4,
      EMPTY: 30,
      OUTDATED: 0,
    },
    successfullyUpdatedCells: 0,
    newlyCreatedTranslationRows: 0,
    skippedBecauseTheyBecameValid: 0,
    failedTranslationCells: 0,
    failedDetails: [],
  };

  const seenTargets = new Set();

  for (const item of remediations) {
    const targetKey = `${item.tour_id}:${item.target_language}:${item.field}`;
    if (seenTargets.has(targetKey)) continue;
    seenTargets.add(targetKey);

    let tour = await getTourById(item.tour_id) || await getTourBySlug(item.slug);
    if (!tour) {
      execution.failedTranslationCells += 1;
      execution.failedDetails.push({
        tour_id: item.tour_id,
        tour_slug: item.slug,
        field: item.field,
        target_language: item.target_language,
        status: item.status,
        reason: 'Tour missing from tours table',
      });
      continue;
    }

    const sourceValue = tour[item.field];
    if (sourceValue === null || sourceValue === undefined || normalizeText(sourceValue) === '') {
      execution.failedTranslationCells += 1;
      execution.failedDetails.push({
        tour_id: tour.id,
        tour_slug: tour.slug,
        field: item.field,
        target_language: item.target_language,
        status: item.status,
        reason: 'Vietnamese source value is empty or null; not inventing content',
      });
      continue;
    }

    const { row, status } = await ensureTargetCellIsRemediable(tour.id, item.target_language, item.field);
    if (status === 'VALID') {
      execution.skippedBecauseTheyBecameValid += 1;
      continue;
    }

    try {
      let translationRow = row;
      if (!translationRow) {
        translationRow = await createMissingTranslationRow(tour, item.target_language);
        execution.newlyCreatedTranslationRows += 1;
      }

      const recheck = getTargetStatus(translationRow?.[item.field], item.target_language);
      if (recheck === 'VALID') {
        execution.skippedBecauseTheyBecameValid += 1;
        continue;
      }

      const translatedValue = await translateField(item.field, sourceValue, item.target_language);
      await updateSingleField(tour.id, item.target_language, item.field, translatedValue);

      const refreshedRow = await getTranslationRow(tour.id, item.target_language);
      const refreshedStatus = getTargetStatus(refreshedRow?.[item.field], item.target_language);
      if (refreshedStatus !== 'VALID') {
        throw new Error(`Target cell still not valid after write: ${item.target_language}/${item.field}`);
      }

      execution.successfullyUpdatedCells += 1;
      console.log(`UPDATED ${tour.id} ${item.target_language} ${item.field}`);
    } catch (error) {
      execution.failedTranslationCells += 1;
      execution.failedDetails.push({
        tour_id: tour.id,
        tour_slug: tour.slug,
        field: item.field,
        target_language: item.target_language,
        status: item.status,
        reason: error && error.message ? error.message : 'Translation request failed',
      });
      console.error(`FAILED ${tour.id} ${item.target_language} ${item.field}: ${error && error.message ? error.message : error}`);
    }
  }

  const finalAudit = { VALID: 0, MISSING: 0, INVALID: 0, EMPTY: 0, OUTDATED: 0 };
  const auditEntries = [];
  const allTours = await sequelize.query('SELECT * FROM tours', { type: QueryTypes.SELECT });

  for (const tour of allTours) {
    for (const language of ['en', 'zh']) {
      const row = await getTranslationRow(tour.id, language);
      for (const field of REMEDIATION_FIELDS) {
        if (!row) {
          finalAudit.MISSING += 1;
          auditEntries.push({ tour_id: tour.id, slug: tour.slug, field, target_language: language, status: 'MISSING', reason: 'translation row missing' });
          continue;
        }
        const value = row[field];
        if (value === null || value === undefined || normalizeText(value) === '') {
          finalAudit.EMPTY += 1;
          auditEntries.push({ tour_id: tour.id, slug: tour.slug, field, target_language: language, status: 'EMPTY', reason: 'row exists but field is empty/null' });
          continue;
        }
        const sourceValue = tour[field];
        if (sourceValue !== null && sourceValue !== undefined && normalizeText(sourceValue) === normalizeText(value)) {
          finalAudit.INVALID += 1;
          auditEntries.push({ tour_id: tour.id, slug: tour.slug, field, target_language: language, status: 'INVALID', reason: 'value matches Vietnamese source instead of translated target' });
          continue;
        }
        if (isLikelyInvalidTargetText(value, language)) {
          finalAudit.INVALID += 1;
          auditEntries.push({ tour_id: tour.id, slug: tour.slug, field, target_language: language, status: 'INVALID', reason: 'target content is not valid for declared language' });
          continue;
        }
        finalAudit.VALID += 1;
        auditEntries.push({ tour_id: tour.id, slug: tour.slug, field, target_language: language, status: 'VALID', reason: 'exists and matches target content' });
      }
    }
  }

  const reportSummary = {
    originalAudit: execution.originalAudit,
    postRemediationAudit: finalAudit,
    successfullyUpdatedCells: execution.successfullyUpdatedCells,
    newlyCreatedTranslationRows: execution.newlyCreatedTranslationRows,
    existingTranslationFieldsUpdated: execution.successfullyUpdatedCells - execution.newlyCreatedTranslationRows,
    skippedBecauseTheyBecameValid: execution.skippedBecauseTheyBecameValid,
    failedTranslationCells: execution.failedTranslationCells,
    failedTranslationDetails: execution.failedDetails,
    remainingProblematicCells: auditEntries.filter((entry) => ['MISSING', 'INVALID', 'EMPTY'].includes(entry.status)),
  };

  console.log(JSON.stringify(reportSummary, null, 2));
};

main()
  .catch((error) => {
    console.error('REMEDIATION SCRIPT FAILED');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
