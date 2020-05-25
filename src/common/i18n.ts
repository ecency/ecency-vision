import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    enUs: {
        translation: require('../locales/en-US.json')
    }
};

i18n.use(LanguageDetector).init({
    resources,
    fallbackLng: 'enUs',
    interpolation: {
        escapeValue: false
    },
});

export const _t = (k: string, args = {}) => {
    return i18n.t(k, args);
};
