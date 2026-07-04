import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const modules = import.meta.glob('./*/*.json', { eager: true });

const resources = {};

for (const path in modules) {
    const match = path.match(/\.\/([^/]+)\/([^/]+)\.json$/);
    if (match) {
        const [, lng, ns] = match;
        if (!resources[lng]) {
            resources[lng] = { translation: {} };
        }
        resources[lng].translation[ns] = modules[path].default || modules[path];
    }
}

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'vi',
        defaultNS: 'translation',
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng',
        },
    });

export default i18n;
