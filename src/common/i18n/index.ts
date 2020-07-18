import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const enUs = require('./locales/en-US.json')

const resources = {
    ['en-US']: {
        translation: enUs
    }
};

i18n.use(LanguageDetector).init({
    resources,
    fallbackLng: 'en-US',
    interpolation: {
        escapeValue: false
    },
});

export const _t = (k: string, args = {}) => {
    return i18n.t(k, args);
};
