import i18n from "i18next";

import moment from "moment";

export const langOptions = [
    {
        code: "en-US",
        name: "English"
    },
    {
        code: "fi-FI",
        name: "Finnish"
    }
];

const enUs = require("./locales/en-US.json");
const fiFI = require("./locales/fi-FI.json");

const resources = {
    ["en-US"]: {
        translation: enUs
    },
    ["fi-FI"]: {
        translation: fiFI
    }
};

i18n.init({
    resources,
    fallbackLng: "en-US",
    interpolation: {
        escapeValue: false
    },
})

i18n.on("languageChanged", function (lang) {
    moment.locale(lang);
});

export const _t = (k: string, args = {}) => {
    return i18n.t(k, args);
};
