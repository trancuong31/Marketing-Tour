require('../config/env');

const { QueryTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { translateTexts } = require('../services/translationService');

const TOUR_ID = 16;
const TARGET_LANGUAGE = 'en';
const TRANSLATABLE_FIELDS = [
    'price_includes',
    'price_excludes',
    'terms_and_notes',
    'cancellation_policy',
];

const containsChineseText = (value) => /[\u3400-\u9FFF]/u.test(String(value || ''));

const shorten = (value) => String(value || '')
    .replace(/\s+/g, ' ')
    .slice(0, 120);

const getTourSource = async () => {
    const [tour] = await sequelize.query(
        `SELECT id, ${TRANSLATABLE_FIELDS.map(field => `\`${field}\``).join(', ')}
         FROM tours
         WHERE id = ?`,
        {
            replacements: [TOUR_ID],
            type: QueryTypes.SELECT,
        },
    );

    if (!tour) {
        throw new Error(`Tour id=${TOUR_ID} not found.`);
    }

    return tour;
};

const getCurrentEnglishTranslation = async () => {
    const [translation] = await sequelize.query(
        `SELECT tour_id, language, ${TRANSLATABLE_FIELDS.map(field => `\`${field}\``).join(', ')}
         FROM tour_translations
         WHERE tour_id = ? AND language = ?`,
        {
            replacements: [TOUR_ID, TARGET_LANGUAGE],
            type: QueryTypes.SELECT,
        },
    );

    if (!translation) {
        throw new Error(`English translation for tour id=${TOUR_ID} not found.`);
    }

    return translation;
};

const updateField = async (field, translatedText) => {
    if (!TRANSLATABLE_FIELDS.includes(field)) {
        throw new Error(`Unsafe field name: ${field}`);
    }

    await sequelize.query(
        `UPDATE tour_translations SET \`${field}\` = ? WHERE tour_id = ? AND language = ?`,
        {
            replacements: [translatedText, TOUR_ID, TARGET_LANGUAGE],
            type: QueryTypes.UPDATE,
        },
    );
};

const repairField = async (sourceTour, currentTranslation, field) => {
    if (!containsChineseText(currentTranslation[field])) {
        console.log(`[skip] ${field}: English value does not contain Chinese text.`);
        return;
    }

    const sourceText = String(sourceTour[field] || '').trim();
    if (!sourceText) {
        console.log(`[skip] ${field}: Vietnamese source is empty.`);
        return;
    }

    console.log(`[translate] ${field}: ${sourceText.length} chars`);
    const translated = await translateTexts({
        texts: { [field]: sourceText },
        targetLang: TARGET_LANGUAGE,
        strict: true,
    });

    const translatedText = translated[field] || '';
    if (!translatedText.trim()) {
        throw new Error(`Translated text for ${field} is empty.`);
    }

    if (containsChineseText(translatedText)) {
        throw new Error(`Translated text for ${field} still contains Chinese text: ${shorten(translatedText)}`);
    }

    await updateField(field, translatedText);
    console.log(`[done] ${field}: ${shorten(translatedText)}`);
};

const run = async () => {
    try {
        const sourceTour = await getTourSource();
        const currentTranslation = await getCurrentEnglishTranslation();

        for (const field of TRANSLATABLE_FIELDS) {
            await repairField(sourceTour, currentTranslation, field);
        }

        console.log('English translation repair completed.');
        process.exitCode = 0;
    } catch (error) {
        console.error('English translation repair failed:', error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

run();
