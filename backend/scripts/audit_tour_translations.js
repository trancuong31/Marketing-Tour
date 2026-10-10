const fs = require('fs');
const path = require('path');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const REPORT_PATH = path.join(__dirname, '../tour_translation_audit_report.json');
const FIELDS = [
    'title',
    'summary',
    'highlights',
    'price_includes',
    'price_excludes',
    'terms_and_notes',
    'cancellation_policy',
];

const normalize = value => String(value ?? '').trim();

const isLikelyInvalidTargetText = (value, language) => {
    const text = normalize(value);
    if (!text) return true;
    if (language === 'en') return /[\u3400-\u9FFF]/u.test(text);
    if (language === 'zh') return /[A-Za-z]/.test(text) && !/[\u3400-\u9FFF]/u.test(text);
    return false;
};

const classifyCell = (tour, row, field, language) => {
    const source = normalize(tour[field]);
    const target = normalize(row?.[field]);

    if (!source) return 'SOURCE_EMPTY';
    if (!row) return 'MISSING';
    if (!target) return 'EMPTY';
    if (target === source || isLikelyInvalidTargetText(target, language)) return 'INVALID';
    return 'VALID';
};

const main = async () => {
    const originalReport = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
    const [tours, translations] = await Promise.all([
        sequelize.query('SELECT * FROM tours ORDER BY id', { type: QueryTypes.SELECT }),
        sequelize.query('SELECT * FROM tour_translations ORDER BY tour_id, language', { type: QueryTypes.SELECT }),
    ]);

    const totals = {
        VALID: 0,
        MISSING: 0,
        EMPTY: 0,
        SOURCE_EMPTY: 0,
        INVALID: 0,
        OUTDATED: 0,
    };
    const currentCells = [];
    const translationByKey = new Map(translations.map(row => [`${row.tour_id}:${row.language}`, row]));

    for (const tour of tours) {
        for (const language of ['en', 'zh']) {
            const row = translationByKey.get(`${tour.id}:${language}`) || null;
            for (const field of FIELDS) {
                const status = classifyCell(tour, row, field, language);
                totals[status] += 1;
                currentCells.push({ tour_id: tour.id, field, target_language: language, status });
            }
        }
    }

    const originalEligible = originalReport.audit.filter(entry => (
        entry.status === 'MISSING' && ['title', 'summary'].includes(entry.field)
    ));
    const originalEligibleWithSource = originalEligible.filter(entry => {
        const tour = tours.find(item => item.id === entry.tour_id);
        return Boolean(normalize(tour?.[entry.field]));
    });
    const currentByKey = new Map(currentCells.map(cell => [
        `${cell.tour_id}:${cell.target_language}:${cell.field}`,
        cell,
    ]));
    const successfullyRemediated = originalEligibleWithSource.filter(entry => (
        currentByKey.get(`${entry.tour_id}:${entry.target_language}:${entry.field}`)?.status === 'VALID'
    ));

    console.log(JSON.stringify({
        mode: 'READ_ONLY',
        databaseWrites: 0,
        apiRequests: 0,
        audit: totals,
        eligibleRemediationCells: originalEligibleWithSource.length,
        successfullyRemediatedCells: successfullyRemediated.length,
        skippedSourceEmptyCells: totals.SOURCE_EMPTY,
        outdatedCells: currentCells.filter(cell => cell.status === 'OUTDATED').length,
    }, null, 2));
};

main()
    .catch(error => {
        console.error('READ-ONLY AUDIT FAILED');
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await sequelize.close();
    });