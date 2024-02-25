import Cookies from "js-cookie";

import { Dispatch } from "redux";

import defaults from "../../constants/defaults.json";

import { AppState } from "../index";

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
  NsfwSetAction,
  SetLastIndexPathAction,
  Theme,
  ThemeChangeAction,
} from "./types";

import { CommonActionTypes } from "../common";

import * as ls from "../../util/local-storage";

import filterTagExtract from "../../helper/filter-tag-extract";
import { setupConfig } from "../../../setup";

export const initialState: Global = {
  filter: AllFilter[defaults.filter as keyof typeof AllFilter] || AllFilter.hot,
  theme: (setupConfig.selectedTheme && Theme[setupConfig.selectedTheme as keyof typeof Theme]) || Theme.day,
  listStyle: (defaults.listStyle && ListStyle[defaults.listStyle as keyof typeof ListStyle]) || ListStyle.row,
  tag: "",
  intro: true,
  currency: defaults && defaults.currency && defaults.currency.currency,
  currencyRate: defaults && defaults.currency && defaults.currency.rate,
  currencySymbol: defaults && defaults.currency && defaults.currency.symbol,
  lang: "en-US",
  searchIndexCount: 0,
  canUseWebp: false,
  hasKeyChain: false,
  isElectron: false,
  newVersion: null,
  notifications: true,
  nsfw: false,
  isMobile: false,
  usePrivate: false,
  ctheme: "sky",
  tags: ["spk", "3speak"],
  hive_id: "hive-112019",
  baseApiUrl: "https://account-creator.3speak.tv/api",
};

export default (state: Global = initialState, action: Actions): Global => {
  switch (action.type) {
    case CommonActionTypes.LOCATION_CHANGE: {
      const { pathname } = action.payload.location;
      const params = filterTagExtract(pathname);

      if (!params) {
        return state;
      }

      const { filter, tag } = params;

      return { ...state, filter: AllFilter[filter as keyof typeof AllFilter] || "", tag: tag };
    }
    case ActionTypes.THEME_CHANGE: {
      const { theme } = action;
      return { ...state, theme };
    }
    case ActionTypes.INTRO_HIDE: {
      return { ...state, intro: false };
    }
    case ActionTypes.LIST_STYLE_CHANGE: {
      const { listStyle } = action;
      return { ...state, listStyle };
    }
    case ActionTypes.NEW_VERSION_CHANGE: {
      const { version } = action;
      return { ...state, newVersion: version };
    }
    case ActionTypes.NOTIFICATIONS_MUTE: {
      return { ...state, notifications: false };
    }
    case ActionTypes.NOTIFICATIONS_UNMUTE: {
      return { ...state, notifications: true };
    }
    case ActionTypes.CURRENCY_SET: {
      const { currency, currencyRate, currencySymbol } = action;
      return { ...state, currency, currencyRate, currencySymbol };
    }
    case ActionTypes.LANG_SET: {
      const { lang } = action;
      return { ...state, lang };
    }
    case ActionTypes.NSFW_SET: {
      const { value } = action;
      return { ...state, nsfw: value };
    }
    case ActionTypes.HAS_KEYCHAIN: {
      return { ...state, hasKeyChain: true };
    }
    default:
      return state;
  }
};

/* Actions */
export const toggleTheme =
  (theme_key?: Theme) => (dispatch: Dispatch, getState: () => AppState) => {
    const { global } = getState();

    const { theme } = global;
    const initialTheme = global.ctheme;
    let newTheme: any = theme === initialTheme ? Theme.night : initialTheme;

    if (!!theme_key) {
      newTheme = theme_key;
    }

    ls.set("theme", newTheme);
    Cookies.set("theme", newTheme);
    dispatch(themeChangeAct(newTheme));
    //if (isMobile) {
      let body: any = document.getElementsByTagName("body");
      if (!body) return;
      body = body[0];
      body.classList.remove(`theme-${theme}`);
      body.classList.add(`theme-${newTheme}`);
    //}
  };

export const toggleListStyle = (view: string | null) => (
  dispatch: Dispatch,
  getState: () => AppState
) => {
  const { global } = getState();

  const { listStyle } = global;
  let newStyle: any = null;

  if (view) {
    newStyle = view === ListStyle.row ? ListStyle.row : ListStyle.grid;
  } else {
    newStyle = listStyle === ListStyle.row ? ListStyle.grid : ListStyle.row;
  }

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

export const setCurrency = (currency: string, rate: number, symbol: string) => (
  dispatch: Dispatch
) => {
  ls.set("currency", currency);

  dispatch(setCurrencyAct(currency, rate, symbol));
};

export const setLang = (lang: string) => (dispatch: Dispatch) => {
  ls.set("lang", lang);

  dispatch(setLangAct(lang));
};

export const setNsfw = (value: boolean) => (dispatch: Dispatch) => {
  ls.set("nsfw", value);

  dispatch(setNsfwAct(value));
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

export const listStyleChangeAct = (
  listStyle: ListStyle
): ListStyleChangeAction => {
  return {
    type: ActionTypes.LIST_STYLE_CHANGE,
    listStyle,
  };
};

export const newVersionChangeAct = (
  version: string | null
): NewVersionChangeAction => {
  return {
    type: ActionTypes.NEW_VERSION_CHANGE,
    version,
  };
};

export const muteNotificationsAct = (): NotificationsMuteAction => {
  return {
    type: ActionTypes.NOTIFICATIONS_MUTE,
  };
};

export const unMuteNotificationsAct = (): NotificationsUnMuteAction => {
  return {
    type: ActionTypes.NOTIFICATIONS_UNMUTE,
  };
};

export const setCurrencyAct = (
  currency: string,
  currencyRate: number,
  currencySymbol: string
): CurrencySetAction => {
  return {
    type: ActionTypes.CURRENCY_SET,
    currency,
    currencyRate,
    currencySymbol,
  };
};

export const setLangAct = (lang: string): LangSetAction => {
  return {
    type: ActionTypes.LANG_SET,
    lang,
  };
};

export const setNsfwAct = (value: boolean): NsfwSetAction => {
  return {
    type: ActionTypes.NSFW_SET,
    value,
  };
};

export const hasKeyChainAct = (): HasKeyChainAction => {
  return {
    type: ActionTypes.HAS_KEYCHAIN,
  };
};

export const setLastIndexPath = (path: string | null) => (dispatch: Dispatch) => {
  dispatch(setLastIndexPathAct(path));
};

export const setLastIndexPathAct = (path: string | null): SetLastIndexPathAction => ({
  type: ActionTypes.SET_LAST_INDEX_PATH,
  path
});