const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const FIELD_NAMES = ['title', 'summary', 'highlights', 'price_includes', 'price_excludes', 'terms_and_notes', 'cancellation_policy'];
const ELIGIBLE_FIELDS = new Set(['title', 'summary']);
const REPORT_PATH = path.join(__dirname, '../tour_translation_audit_report.json');

const normalize = value => String(value ?? '').trim();
const isLikelyInvalidTargetText = (value, language) => {
    const text = normalize(value);
    if (!text) return true;
    if (language === 'en') return /[\u3400-\u9FFF]/u.test(text);
    if (language === 'zh') return /[A-Za-z]/.test(text) && !/[\u3400-\u9FFF]/u.test(text);
    return false;
};

const isValidTarget = (value, source, language) => {
    const text = normalize(value);
    return Boolean(text) && text !== normalize(source) && !isLikelyInvalidTargetText(text, language);
};

const selectRows = async (sql, replacements = [], options = {}) => sequelize.query(sql, {
    replacements,
    type: QueryTypes.SELECT,
    ...options,
});

const snapshotDatabase = async () => {
    const tours = await selectRows(`SELECT id, title, summary, highlights, price_includes, price_excludes,
        terms_and_notes, cancellation_policy FROM tours ORDER BY id`);
    const translations = await selectRows(`SELECT tour_id, language, title, slug, summary, highlights,
        price_includes, price_excludes, terms_and_notes, cancellation_policy
        FROM tour_translations ORDER BY tour_id, language`);
    return { tours, translations };
};

const buildEligibleGroups = async (report) => {
    const groups = new Map();
    const entries = (report.audit || []).filter(entry => entry.status === 'MISSING' && ELIGIBLE_FIELDS.has(entry.field));

    for (const entry of entries) {
        const [tour] = await selectRows(`SELECT id, slug, title, summary FROM tours WHERE id = ? LIMIT 1`, [entry.tour_id]);
        const [row] = await selectRows(`SELECT tour_id, language, title, summary FROM tour_translations
            WHERE tour_id = ? AND language = ? LIMIT 1`, [entry.tour_id, entry.target_language]);
        const source = normalize(tour?.[entry.field]);
        if (!source || row) continue;

        const key = `${entry.tour_id}:${entry.target_language}`;
        if (!groups.has(key)) {
            groups.set(key, { tourId: entry.tour_id, language: entry.target_language, fields: new Set(), tour });
        }
        groups.get(key).fields.add(entry.field);
    }

    return [...groups.values()]
        .map(group => ({ ...group, fields: [...group.fields].sort() }))
        .filter(group => group.fields.length > 0);
};

const main = async () => {
    const originalReport = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
    const before = await snapshotDatabase();
    const originalValidCells = originalReport.audit.filter(entry => entry.status === 'VALID');
    const protectedTranslationCells = new Map();

    for (const cell of originalValidCells) {
        const [row] = await selectRows(`SELECT \`${cell.field}\` AS value FROM tour_translations
            WHERE tour_id = ? AND language = ? LIMIT 1`, [cell.tour_id, cell.target_language]);
        protectedTranslationCells.set(`${cell.tour_id}:${cell.target_language}:${cell.field}`, row?.value ?? null);
    }

    const eligibleGroups = await buildEligibleGroups(originalReport);
    const expectedCells = eligibleGroups.reduce((total, group) => total + group.fields.length, 0);
    const originalFetch = global.fetch;
    let apiRequests = 0;
    const providerErrors = [];
    global.fetch = async (...args) => {
        apiRequests += 1;
        return originalFetch(...args);
    };

    const execution = {
        mode: 'LIVE_ELIGIBLE_ONLY',
        eligibleCells: expectedCells,
        successfullyTranslatedCells: 0,
        successfullyPersistedCells: 0,
        newlyCreatedTranslationRows: 0,
        existingRowsUpdated: 0,
        skippedCells: 0,
        failedCells: 0,
        failedDetails: [],
    };

    try {
        for (const group of eligibleGroups) {
            const sourceValues = {};
            let initialRow = null;
            let initialTour = null;

            for (const field of group.fields) {
                const [tour] = await selectRows(`SELECT id, slug, \`${field}\` AS source_value FROM tours WHERE id = ? LIMIT 1`, [group.tourId]);
                const [row] = await selectRows(`SELECT tour_id, language, \`${field}\` AS target_value FROM tour_translations
                    WHERE tour_id = ? AND language = ? LIMIT 1`, [group.tourId, group.language]);
                const sourceValue = normalize(tour?.source_value);
                const targetValue = normalize(row?.target_value);

                if (!sourceValue) {
                    execution.skippedCells += 1;
                    continue;
                }
                if (targetValue && isValidTarget(targetValue, sourceValue, group.language)) {
                    execution.skippedCells += 1;
                    continue;
                }

                sourceValues[field] = sourceValue;
                initialRow = row || initialRow;
                initialTour = tour || initialTour;
            }

            if (Object.keys(sourceValues).length === 0) continue;

            let translations;
            try {
                const { translateTexts } = require('../src/services/translationService');
                translations = await translateTexts({ texts: sourceValues, targetLang: group.language, strict: true });
            } catch (error) {
                execution.failedCells += Object.keys(sourceValues).length;
                execution.failedDetails.push({ tour_id: group.tourId, target_language: group.language, fields: Object.keys(sourceValues), reason: error.message });
                providerErrors.push({ tour_id: group.tourId, target_language: group.language, fields: Object.keys(sourceValues), reason: error.message });
                continue;
            }

            const validTranslations = {};
            for (const field of Object.keys(sourceValues)) {
                const translated = normalize(translations?.[field]);
                if (!isValidTarget(translated, sourceValues[field], group.language)) {
                    execution.failedCells += 1;
                    execution.failedDetails.push({ tour_id: group.tourId, target_language: group.language, field, reason: 'Translation result was empty, reused source, or failed target-language validation' });
                    continue;
                }
                validTranslations[field] = translated;
                execution.successfullyTranslatedCells += 1;
            }

            if (Object.keys(validTranslations).length === 0) continue;

            const transaction = await sequelize.transaction();
            try {
                const [currentTour] = await selectRows(`SELECT id, slug, \`title\`, \`summary\` FROM tours WHERE id = ? LIMIT 1`, [group.tourId], { transaction });
                const [currentRow] = await selectRows(`SELECT tour_id, language, title, summary FROM tour_translations
                    WHERE tour_id = ? AND language = ? LIMIT 1`, [group.tourId, group.language], { transaction });

                const payload = {};
                for (const field of Object.keys(validTranslations)) {
                    const currentSource = normalize(currentTour?.[field]);
                    const currentValue = normalize(currentRow?.[field]);
                    if (!currentSource || (currentValue && isValidTarget(currentValue, currentSource, group.language))) {
                        execution.skippedCells += 1;
                        continue;
                    }
                    payload[field] = validTranslations[field];
                }

                if (Object.keys(payload).length === 0) {
                    await transaction.commit();
                    continue;
                }

                if (!currentRow) {
                    if (!payload.title) {
                        throw new Error('Cannot create translation row without a valid title translation');
                    }
                    const translatedSlug = slugify(payload.title, { lower: true, strict: true, locale: 'vi' }) || `${group.tourId}-${group.language}`;
                    await sequelize.query(`INSERT INTO tour_translations (tour_id, language, title, slug, summary)
                        VALUES (?, ?, ?, ?, ?)`, {
                        replacements: [group.tourId, group.language, payload.title, translatedSlug, payload.summary || null],
                        type: QueryTypes.INSERT,
                        transaction,
                    });
                    execution.newlyCreatedTranslationRows += 1;
                } else {
                    const assignments = Object.keys(payload).map(field => `\`${field}\` = ?`).join(', ');
                    await sequelize.query(`UPDATE tour_translations SET ${assignments}
                        WHERE tour_id = ? AND language = ?`, {
                        replacements: [...Object.keys(payload).map(field => payload[field]), group.tourId, group.language],
                        type: QueryTypes.UPDATE,
                        transaction,
                    });
                    execution.existingRowsUpdated += 1;
                }

                await transaction.commit();
                execution.successfullyPersistedCells += Object.keys(payload).length;
            } catch (error) {
                await transaction.rollback();
                execution.failedCells += Object.keys(validTranslations).length;
                execution.failedDetails.push({ tour_id: group.tourId, target_language: group.language, fields: Object.keys(validTranslations), reason: error.message });
            }
        }
    } finally {
        global.fetch = originalFetch;
    }

    execution.apiRequests = apiRequests;
    execution.providerErrors = providerErrors;

    const after = await snapshotDatabase();
    const beforeTours = JSON.stringify(before.tours);
    const afterTours = JSON.stringify(after.tours);
    const validCellsUnchanged = originalValidCells.every(cell => {
        const key = `${cell.tour_id}:${cell.target_language}:${cell.field}`;
        const row = after.translations.find(item => item.tour_id === cell.tour_id && item.language === cell.target_language);
        return normalize(row?.[cell.field]) === normalize(protectedTranslationCells.get(key));
    });
    const eligibleKeys = new Set(eligibleGroups.flatMap(group => group.fields.map(field => `${group.tourId}:${group.language}:${field}`)));
    const unrelatedCellsUnchanged = before.translations.every(row => {
        const afterRow = after.translations.find(item => item.tour_id === row.tour_id && item.language === row.language);
        return FIELD_NAMES.every(field => eligibleKeys.has(`${row.tour_id}:${row.language}:${field}`) || normalize(afterRow?.[field]) === normalize(row[field]));
    });

    const totals = { VALID: 0, MISSING: 0, INVALID: 0, EMPTY: 0, OUTDATED: 0 };
    for (const tour of after.tours) {
        for (const language of ['en', 'zh']) {
            const row = after.translations.find(item => item.tour_id === tour.id && item.language === language);
            for (const field of FIELD_NAMES) {
                if (!row) {
                    totals.MISSING += 1;
                } else if (!normalize(row[field])) {
                    totals.EMPTY += 1;
                } else if (normalize(row[field]) === normalize(tour[field]) || isLikelyInvalidTargetText(row[field], language)) {
                    totals.INVALID += 1;
                } else {
                    totals.VALID += 1;
                }
            }
        }
    }

    console.log(JSON.stringify({
        original: originalReport.totals,
        execution,
        finalAudit: totals,
        verification: {
            vietnameseSourceUnchanged: beforeTours === afterTours,
            originalValidCellsUnchanged: validCellsUnchanged,
            unrelatedTranslationCellsUnchanged: unrelatedCellsUnchanged,
            eligibleGroups: eligibleGroups.length,
            expectedEligibleCells: expectedCells,
        },
    }, null, 2));
};

main()
    .catch(error => {
        console.error('ELIGIBLE REMEDIATION FAILED');
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await sequelize.close();
    });