/**
 * Fix Vietnamese accents for editable UI translations.
 * Run: node src/migrations/fix_ui_translation_vi_accents.js
 */
require('../config/env');
const { sequelize } = require('../config/database');
const logger = require('../config/logger');

const VI_TRANSLATION_FIXES = {
    'admin.menu.banners': 'Qu\u1ea3n l\u00fd banner',
    'admin.menu.bookings': 'Qu\u1ea3n l\u00fd \u0111\u01a1n',
    'admin.menu.content': 'B\u00e0i vi\u1ebft',
    'admin.menu.dashboard': 'B\u1ea3ng \u0111i\u1ec1u khi\u1ec3n',
    'admin.menu.reviews': 'Qu\u1ea3n l\u00fd \u0111\u00e1nh gi\u00e1',
    'admin.menu.tours': 'Qu\u1ea3n l\u00fd tour',
    'admin.menu.translations': 'Qu\u1ea3n l\u00fd Ng\u00f4n ng\u1eef',
    'admin.translations.actions': 'H\u00e0nh \u0111\u1ed9ng',
    'admin.translations.add': 'Th\u00eam key',
    'admin.translations.chinese': 'Ti\u1ebfng Trung',
    'admin.translations.confirmDelete': 'X\u00f3a b\u1ea3n d\u1ecbch n\u00e0y?',
    'admin.translations.createTitle': 'Th\u00eam b\u1ea3n d\u1ecbch',
    'admin.translations.deleteError': 'Kh\u00f4ng th\u1ec3 x\u00f3a b\u1ea3n d\u1ecbch',
    'admin.translations.deleteSuccess': '\u0110\u00e3 x\u00f3a b\u1ea3n d\u1ecbch',
    'admin.translations.editTitle': 'S\u1eeda b\u1ea3n d\u1ecbch',
    'admin.translations.empty': 'Kh\u00f4ng t\u00ecm th\u1ea5y b\u1ea3n d\u1ecbch',
    'admin.translations.english': 'Ti\u1ebfng Anh',
    'admin.translations.loadError': 'Kh\u00f4ng th\u1ec3 t\u1ea3i danh s\u00e1ch ng\u00f4n ng\u1eef',
    'admin.translations.saveError': 'Kh\u00f4ng th\u1ec3 l\u01b0u b\u1ea3n d\u1ecbch',
    'admin.translations.saveSuccess': '\u0110\u00e3 l\u01b0u b\u1ea3n d\u1ecbch',
    'admin.translations.searchPlaceholder': 'T\u00ecm key ho\u1eb7c n\u1ed9i dung...',
    'admin.translations.subtitle': 'Qu\u1ea3n l\u00fd b\u1ea3n d\u1ecbch VI, EN, ZH',
    'admin.translations.vietnamese': 'Ti\u1ebfng Vi\u1ec7t',
    'admin.tours.add': 'Th\u00eam tour',
    'admin.tours.searchPlaceholder': 'T\u00ecm t\u00ean tour...',
    'admin.tours.total': 'Hi\u1ec3n th\u1ecb {{count}} tour',
    'admin.tours.empty': 'Kh\u00f4ng t\u00ecm th\u1ea5y tour',
    'admin.tours.noPrice': 'Ch\u01b0a c\u00f3 gi\u00e1',
    'admin.tours.duration': '{{days}}N{{nights}}\u0110',
    'admin.tours.columns.category': 'Danh m\u1ee5c',
    'admin.tours.columns.priceFrom': 'Gi\u00e1 t\u1eeb',
    'admin.tours.columns.duration': 'Th\u1eddi gian',
    'admin.tours.columns.status': 'Tr\u1ea1ng th\u00e1i',
    'admin.tours.columns.actions': 'H\u00e0nh \u0111\u1ed9ng',
    'admin.tours.status.active': 'Ho\u1ea1t \u0111\u1ed9ng',
    'admin.tours.status.hidden': '\u1ea8n',
    'admin.tours.status.soldOut': 'H\u1ebft ch\u1ed7',
    'admin.tours.badge.featured': 'N\u1ed5i b\u1eadt',
    'admin.tours.badge.promotion': 'Khuy\u1ebfn m\u00e3i',
    'admin.votes.searchPlaceholder': 'T\u00ecm theo t\u00ean, email ho\u1eb7c tour...',
    'admin.votes.empty': 'Kh\u00f4ng t\u00ecm th\u1ea5y \u0111\u00e1nh gi\u00e1',
    'admin.votes.imageAlt': '\u1ea2nh \u0111\u00e1nh gi\u00e1',
    'admin.votes.total': 'Hi\u1ec3n th\u1ecb {{filtered}} / {{total}} \u0111\u00e1nh gi\u00e1',
    'admin.votes.columns.customer': 'Kh\u00e1ch h\u00e0ng',
    'admin.votes.columns.rating': '\u0110\u00e1nh gi\u00e1',
    'admin.votes.columns.comment': 'Nh\u1eadn x\u00e9t',
    'admin.votes.columns.status': 'Tr\u1ea1ng th\u00e1i',
    'admin.votes.columns.actions': 'H\u00e0nh \u0111\u1ed9ng',
    'admin.votes.filters.all': 'T\u1ea5t c\u1ea3',
    'admin.votes.filters.pending': 'Ch\u1edd duy\u1ec7t',
    'admin.votes.filters.approved': '\u0110\u00e3 duy\u1ec7t',
    'admin.votes.status.pending': 'Ch\u1edd duy\u1ec7t',
    'admin.votes.status.approved': '\u0110\u00e3 duy\u1ec7t',
    'admin.votes.actions.approve': 'Duy\u1ec7t',
    'admin.votes.actions.reject': 'H\u1ee7y duy\u1ec7t',
};

const run = async () => {
    try {
        await sequelize.authenticate();

        const entries = Object.entries(VI_TRANSLATION_FIXES);
        for (const [translationKey, vi] of entries) {
            await sequelize.query(
                'UPDATE `translations` SET `vi` = ?, `updated_at` = NOW() WHERE `translation_key` = ?',
                { replacements: [vi, translationKey] },
            );
        }

        logger.info(`Fixed Vietnamese accents for ${entries.length} UI translations.`);
        process.exitCode = 0;
    } catch (error) {
        logger.error('Unable to fix Vietnamese UI translations:', error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

run();
