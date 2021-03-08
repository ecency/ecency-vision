import Cookies from "js-cookie";

import {Dispatch} from "redux";

import defaults from "../../constants/defaults.json";

import {AppState} from "../index";

import {
    Actions,
    ActionTypes,
    AllFilter,
    Global,
    HasKeyChainAction,
    IntroHideAction,
    ListStyle,
    ListStyleChangeAction,
    NewVersionChangeAction,
    NotificationsMuteAction,
    NotificationsUnMuteAction,
    CurrencySetAction,
    LangSetAction,
    Theme,
    ThemeChangeAction
} from "./types";

import {CommonActionTypes} from "../common";

import * as ls from "../../util/local-storage";

import filterTagExtract from "../../helper/filter-tag-extract";

export const initialState: Global = {
    filter: AllFilter[defaults.filter],
    tag: "",
    theme: Theme[defaults.theme],
    listStyle: ListStyle[defaults.listStyle],
    intro: true,
    currency: defaults.currency.currency,
    currencyRate: defaults.currency.rate,
    currencySymbol: defaults.currency.symbol,
    lang: "en-US",
    searchIndexCount: 0,
    canUseWebp: false,
    hasKeyChain: false,
    isElectron: false,
    newVersion: null,
    notifications: true,
    isMobile: false,
    privateApi: true
};

export default (state: Global = initialState, action: Actions): Global => {
    switch (action.type) {
        case CommonActionTypes.LOCATION_CHANGE: {
            const {pathname} = action.payload.location;
            const params = filterTagExtract(pathname);

            if (!params) {
                return state;
            }

            const {filter, tag} = params;

            return {...state, filter: AllFilter[filter] || "", tag: tag};
        }
        case ActionTypes.THEME_CHANGE: {
            const {theme} = action;
            return {...state, theme};
        }
        case ActionTypes.INTRO_HIDE: {
            return {...state, intro: false};
        }
        case ActionTypes.LIST_STYLE_CHANGE: {
            const {listStyle} = action;
            return {...state, listStyle};
        }
        case ActionTypes.NEW_VERSION_CHANGE: {
            const {version} = action;
            return {...state, newVersion: version};
        }
        case ActionTypes.NOTIFICATIONS_MUTE: {
            return {...state, notifications: false}
        }
        case ActionTypes.NOTIFICATIONS_UNMUTE: {
            return {...state, notifications: true}
        }
        case ActionTypes.CURRENCY_SET: {
            const {currency, currencyRate, currencySymbol} = action
            return {...state, currency, currencyRate, currencySymbol}
        }
        case ActionTypes.LANG_SET: {
            const {lang} = action
            return {...state, lang}
        }
        case ActionTypes.HAS_KEYCHAIN: {
            return {...state, hasKeyChain: true};
        }
        default:
            return state;
    }
};

/* Actions */
export const toggleTheme = () => (dispatch: Dispatch, getState: () => AppState) => {
    const {global} = getState();

    const {theme} = global;
    const newTheme = theme === Theme.day ? Theme.night : Theme.day;

    ls.set("theme", newTheme);
    Cookies.set("theme", newTheme);

    dispatch(themeChangeAct(newTheme));
};

export const toggleListStyle = () => (dispatch: Dispatch, getState: () => AppState) => {
    const {global} = getState();

    const {listStyle} = global;
    const newStyle = listStyle === ListStyle.row ? ListStyle.grid : ListStyle.row;

    ls.set("list-style", newStyle);
    Cookies.set("list-style", newStyle);

    dispatch(listStyleChangeAct(newStyle));
};

export const hideIntro = () => (dispatch: Dispatch) => {
    ls.set("hide-intro", "1");
    Cookies.set("hide-intro", "1");

    dispatch(hideIntroAct());
};

export const dismissNewVersion = () => (dispatch: Dispatch) => {
    dispatch(newVersionChangeAct(null));
};

export const muteNotifications = () => (dispatch: Dispatch) => {
    ls.set("notifications", false);

    dispatch(muteNotificationsAct());
};

export const unMuteNotifications = () => (dispatch: Dispatch) => {
    ls.set("notifications", true);

    dispatch(unMuteNotificationsAct());
};

export const setCurrency = (currency: string, rate: number, symbol: string) => (dispatch: Dispatch) => {
    ls.set("currency", currency);

    dispatch(setCurrencyAct(currency, rate, symbol));
};

export const setLang = (lang: string) => (dispatch: Dispatch) => {
    ls.set("lang", lang);

    dispatch(setLangAct(lang));
};


/* Action Creators */
export const themeChangeAct = (theme: Theme): ThemeChangeAction => {
    return {
        type: ActionTypes.THEME_CHANGE,
        theme,
    };
};

export const hideIntroAct = (): IntroHideAction => {
    return {
        type: ActionTypes.INTRO_HIDE,
    };
};

export const listStyleChangeAct = (listStyle: ListStyle): ListStyleChangeAction => {
    return {
        type: ActionTypes.LIST_STYLE_CHANGE,
        listStyle,
    };
};

export const newVersionChangeAct = (version: string | null): NewVersionChangeAction => {
    return {
        type: ActionTypes.NEW_VERSION_CHANGE,
        version,
    };
};

export const muteNotificationsAct = (): NotificationsMuteAction => {
    return {
        type: ActionTypes.NOTIFICATIONS_MUTE
    };
};

export const unMuteNotificationsAct = (): NotificationsUnMuteAction => {
    return {
        type: ActionTypes.NOTIFICATIONS_UNMUTE
    };
};

export const setCurrencyAct = (currency: string, currencyRate: number, currencySymbol: string): CurrencySetAction => {
    return {
        type: ActionTypes.CURRENCY_SET,
        currency,
        currencyRate,
        currencySymbol
    };
}

export const setLangAct = (lang: string): LangSetAction => {
    return {
        type: ActionTypes.LANG_SET,
        lang
    };
}

export const hasKeyChainAct = (): HasKeyChainAction => {
    return {
        type: ActionTypes.HAS_KEYCHAIN
    };
};
