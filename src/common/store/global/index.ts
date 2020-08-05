import Cookies from "js-cookie";

import { Dispatch } from "redux";

import defaults from "../../constants/defaults.json";

import { AppState } from "../index";

import {
  ListStyle,
  Theme,
  AllFilter,
  Global,
  Actions,
  ActionTypes,
  IntroHideAction,
  ListStyleChangeAction,
  ThemeChangeAction,
} from "./types";

import { CommonActionTypes } from "../common";

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
  searchIndexCount: 0
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
    default:
      return state;
  }
};

/* Actions */
export const toggleTheme = () => (dispatch: Dispatch, getState: () => AppState) => {
  const { global } = getState();

  const { theme } = global;
  const newTheme = theme === Theme.day ? Theme.night : Theme.day;

  Cookies.set("theme", newTheme);

  dispatch(themeChangeAct(newTheme));
};

export const toggleListStyle = () => (dispatch: Dispatch, getState: () => AppState) => {
  const { global } = getState();

  const { listStyle } = global;
  const newStyle = listStyle === ListStyle.row ? ListStyle.grid : ListStyle.row;

  Cookies.set("list-style", newStyle);

  dispatch(listStyleChangeAct(newStyle));
};

export const hideIntro = () => (dispatch: Dispatch) => {
  Cookies.set("hide-intro", "1");
  dispatch(hideIntroAct());
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
