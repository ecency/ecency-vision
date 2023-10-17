import Cookies from "js-cookie";

import { Dispatch } from "redux";

import defaults from "../../constants/defaults.json";
import { AppState } from "../index";
import {
  Actions,
  ActionTypes,
  AllFilter,
  CurrencySetAction,
  Global,
  HasKeyChainAction,
  IntroHideAction,
  LangSetAction,
  ListStyle,
  ListStyleChangeAction,
  NewVersionChangeAction,
  NotificationsMuteAction,
  NotificationsUnMuteAction,
  NsfwSetAction,
  SetLastIndexPathAction,
  Theme,
  ThemeChangeAction
} from "./types";
import { CommonActionTypes } from "../common";
import * as ls from "../../util/local-storage";
import filterTagExtract from "../../helper/filter-tag-extract";

const defaultTheme = ls.get("theme") || defaults.theme;

export const initialState: Global = {
  filter: AllFilter[defaults.filter],
  tag: "",
  theme: Theme[defaultTheme],
  listStyle: ListStyle[defaults.listStyle],
  intro: true,
  currency: defaults && defaults.currency && defaults.currency.currency,
  currencyRate: defaults && defaults.currency && defaults.currency.rate,
  currencySymbol: defaults && defaults.currency && defaults.currency.symbol,
  lang: "en-US",
  searchIndexCount: 0,
  canUseWebp: false,
  hasKeyChain: false,
  newVersion: null,
  notifications: true,
  nsfw: false,
  isMobile: false,
  usePrivate: true,
  hsClientId: "ecency.app",
  lastIndexPath: null
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

      return { ...state, filter: AllFilter[filter] || "", tag: tag };
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
    case ActionTypes.SET_LAST_INDEX_PATH: {
      return { ...state, lastIndexPath: action.path };
    }
    default:
      return state;
  }
};

/* Actions */
export const toggleTheme =
  (theme_key?: Theme) => (dispatch: Dispatch, getState: () => AppState) => {
    const { global } = getState();

    const { theme, isMobile } = global;
    let newTheme: any = theme === Theme.day ? Theme.night : Theme.day;

    if (!!theme_key) {
      newTheme = theme_key;
    }

    const use_system = ls.get("use_system_theme", false);
    if (use_system) {
      let systemTheme: any =
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
          ? Theme.night
          : Theme.day;
      newTheme = systemTheme;
    }

    ls.set("theme", newTheme);
    Cookies.set("theme", newTheme, { expires: 365 });

    dispatch(themeChangeAct(newTheme));
    let body: any = document.getElementsByTagName("body");
    if (!body) return;
    body = body[0];
    body.classList.remove(`theme-${theme}`);
    body.classList.add(`theme-${newTheme}`);
  };

export const toggleListStyle =
  (view: string | null) => (dispatch: Dispatch, getState: () => AppState) => {
    const { global } = getState();

    const { listStyle } = global;
    let newStyle: any = null;

    if (view) {
      newStyle = view === ListStyle.row ? ListStyle.row : ListStyle.grid;
    } else {
      newStyle = listStyle === ListStyle.row ? ListStyle.grid : ListStyle.row;
    }

    ls.set("list-style", newStyle);
    Cookies.set("list-style", newStyle, { expires: 365 });

    dispatch(listStyleChangeAct(newStyle));
  };

export const hideIntro = () => (dispatch: Dispatch) => {
  ls.set("hide-intro", "1");
  Cookies.set("hide-intro", "1", { expires: 365 });

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

export const setCurrency =
  (currency: string, rate: number, symbol: string) => (dispatch: Dispatch) => {
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

export const setLastIndexPath = (path: string | null) => (dispatch: Dispatch) => {
  dispatch(setLastIndexPathAct(path));
};

/* Action Creators */
export const themeChangeAct = (theme: Theme): ThemeChangeAction => {
  return {
    type: ActionTypes.THEME_CHANGE,
    theme
  };
};

export const hideIntroAct = (): IntroHideAction => {
  return {
    type: ActionTypes.INTRO_HIDE
  };
};

export const listStyleChangeAct = (listStyle: ListStyle): ListStyleChangeAction => {
  return {
    type: ActionTypes.LIST_STYLE_CHANGE,
    listStyle
  };
};

export const newVersionChangeAct = (version: string | null): NewVersionChangeAction => {
  return {
    type: ActionTypes.NEW_VERSION_CHANGE,
    version
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

export const setCurrencyAct = (
  currency: string,
  currencyRate: number,
  currencySymbol: string
): CurrencySetAction => {
  return {
    type: ActionTypes.CURRENCY_SET,
    currency,
    currencyRate,
    currencySymbol
  };
};

export const setLangAct = (lang: string): LangSetAction => {
  return {
    type: ActionTypes.LANG_SET,
    lang
  };
};

export const setNsfwAct = (value: boolean): NsfwSetAction => {
  return {
    type: ActionTypes.NSFW_SET,
    value
  };
};

export const hasKeyChainAct = (): HasKeyChainAction => {
  return {
    type: ActionTypes.HAS_KEYCHAIN
  };
};

export const setLastIndexPathAct = (path: string | null): SetLastIndexPathAction => ({
  type: ActionTypes.SET_LAST_INDEX_PATH,
  path
});
