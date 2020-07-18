import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    ['en-US']: {
        translation: require('./locales/en-US.json')
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
