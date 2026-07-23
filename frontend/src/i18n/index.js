import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const modules = import.meta.glob('./*/*.json', { eager: true });
const apiBaseUrl = import.meta.env.VITE_API_URL_PUBLIC || import.meta.env.VITE_API_URL_LOCAL || '/api';

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

const mergeRemoteTranslations = async (language) => {
    const normalizedLanguage = language?.split('-')[0] || 'vi';

    try {
        const response = await fetch(`${apiBaseUrl}/translations/${normalizedLanguage}`);
        if (!response.ok) return;

        const dbTranslations = await response.json();
        i18n.addResourceBundle(
            normalizedLanguage,
            'translation',
            dbTranslations,
            true,
            true,
        );
    } catch {
        // Local JSON remains the fallback when the API is unavailable.
    }
};

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

i18n.on('initialized', () => {
    mergeRemoteTranslations(i18n.language);
});

i18n.on('languageChanged', (language) => {
    mergeRemoteTranslations(language);
});

mergeRemoteTranslations(i18n.language);

export const reloadDbTranslations = () => mergeRemoteTranslations(i18n.language);

export default i18n;
