require('../config/env');

const fs = require('fs');
const path = require('path');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TOUR_ID = 16;
const TARGET_LANGUAGE = 'en';
const ATTACHMENT_PATH = path.resolve(
    'C:/Users/Admin/.codex/attachments/9733edf6-daca-4af9-9dc3-28f643445aee/pasted-text.txt',
);

const SECTION_TITLES = {
    price_includes: 'Giá bao gồm',
    price_excludes: 'Giá không bao gồm',
    terms_and_notes: 'Điều khoản & Lưu ý',
    cancellation_policy: 'Quy định hoàn hủy',
};

const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const normalizeLines = (value) => String(value || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

const extractSection = (content, startTitle, endTitle) => {
    const startIndex = content.indexOf(startTitle);
    if (startIndex < 0) return '';

    const contentStart = startIndex + startTitle.length;
    const endIndex = endTitle ? content.indexOf(endTitle, contentStart) : -1;
    return content.slice(contentStart, endIndex >= 0 ? endIndex : undefined).trim();
};

const linesToListHtml = (text) => {
    const lines = normalizeLines(text)
        .filter(line => line.toLowerCase() !== 'i>');

    return `<ul>${lines.map(line => `<li>${escapeHtml(line)}</li>`).join('')}</ul>`;
};

const linesToArticleHtml = (text) => {
    const lines = normalizeLines(text);
    const blocks = [];
    let listItems = [];

    const flushList = () => {
        if (listItems.length === 0) return;
        blocks.push(`<ul>${listItems.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`);
        listItems = [];
    };

    lines.forEach((line) => {
        const isHeading = /^[A-Z0-9\s.'’&/-]+$/.test(line)
            && /[A-Z]/.test(line)
            && line.length <= 80;
        const isListItem = /^([-+]|(\d+\.))\s+/.test(line)
            || /^[A-Z][^.!?]{10,}[.;:]?$/.test(line) === false;

        if (isHeading) {
            flushList();
            blocks.push(`<p><strong>${escapeHtml(line)}</strong></p>`);
            return;
        }

        if (isListItem) {
            listItems.push(line.replace(/^[-+]\s+/, '').replace(/^\d+\.\s+/, ''));
            return;
        }

        flushList();
        blocks.push(`<p>${escapeHtml(line)}</p>`);
    });

    flushList();
    return blocks.join('');
};

const buildEnglishContent = (rawContent) => {
    const priceIncludes = extractSection(
        rawContent,
        SECTION_TITLES.price_includes,
        SECTION_TITLES.price_excludes,
    );
    const priceExcludes = extractSection(
        rawContent,
        SECTION_TITLES.price_excludes,
        SECTION_TITLES.terms_and_notes,
    );
    const termsAndNotes = extractSection(
        rawContent,
        SECTION_TITLES.terms_and_notes,
        SECTION_TITLES.cancellation_policy,
    );
    const cancellationPolicy = extractSection(
        rawContent,
        SECTION_TITLES.cancellation_policy,
        null,
    );

    return {
        price_includes: linesToListHtml(priceIncludes),
        price_excludes: linesToListHtml(priceExcludes),
        terms_and_notes: linesToArticleHtml(termsAndNotes),
        cancellation_policy: linesToArticleHtml(cancellationPolicy),
    };
};

const assertEnglishContent = (fields) => {
    Object.entries(fields).forEach(([field, value]) => {
        if (!String(value || '').trim()) {
            throw new Error(`${field} is empty after parsing.`);
        }

        if (/[\u3400-\u9FFF]/u.test(value)) {
            throw new Error(`${field} still contains Chinese characters.`);
        }
    });
};

const run = async () => {
    try {
        const rawContent = fs.readFileSync(ATTACHMENT_PATH, 'utf8');
        const fields = buildEnglishContent(rawContent);
        assertEnglishContent(fields);

        await sequelize.query(
            `UPDATE tour_translations
             SET price_includes = ?,
                 price_excludes = ?,
                 terms_and_notes = ?,
                 cancellation_policy = ?
             WHERE tour_id = ? AND language = ?`,
            {
                replacements: [
                    fields.price_includes,
                    fields.price_excludes,
                    fields.terms_and_notes,
                    fields.cancellation_policy,
                    TOUR_ID,
                    TARGET_LANGUAGE,
                ],
                type: QueryTypes.UPDATE,
            },
        );

        console.log(`Repaired English content for tour ${TOUR_ID}.`);
        Object.entries(fields).forEach(([field, value]) => {
            console.log(`${field}: ${value.slice(0, 120).replace(/\s+/g, ' ')}`);
        });
        process.exitCode = 0;
    } catch (error) {
        console.error('Repair from attachment failed:', error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

run();
