import Cookies from 'js-cookie'

import {Dispatch} from 'redux';

import defaults from '../../constants/defaults.json';
import filters from '../../constants/filters.json';
import themes from '../../constants/themes.json';

import {AppState} from '../index';

import {Actions, ActionTypes, State, ThemeChangeAction, IntroHideAction} from './types';

import filterTagExtract from '../../helper/filter-tag-extract';

export const initialState: State = {
    filter: defaults.filter,
    tag: '',
    theme: defaults.theme,
    intro: true
};

export default (state: State = initialState, action: Actions): State => {
    switch (action.type) {
        case ActionTypes.INIT:
        case ActionTypes.LOCATION_CHANGE: {
            const u = new URL(window.location.href);
            const pathname = u.pathname;
            const params = filterTagExtract(pathname);

            if (!params) {
                return state;
            }

            const {filter, tag} = params;

            if (!filters.includes(filter)) {
                return state;
            }

            return {...state, filter: filter, tag: tag};
        }
        case ActionTypes.THEME_CHANGE: {
            const {theme} = action;
            return {...state, theme};
        }
        case ActionTypes.INTRO_HIDE: {
            return {...state, intro: false};
        }
        default:
            return state;
    }
}

/* Actions */
export const toggleTheme = () => (dispatch: Dispatch, getState: () => AppState) => {
    const {global} = getState();

    const {theme} = global;
    const newTheme = theme === themes[0] ? themes[1] : themes[0];

    Cookies.set('theme', newTheme);

    dispatch(themeChangeAct(newTheme));
};

export const hideIntro = () => (dispatch: Dispatch) => {
    Cookies.set('hide-intro', '1');
    dispatch(hideIntroAct());
};


/* Action Creators */
export const themeChangeAct = (theme: string): ThemeChangeAction => {
    return {
        type: ActionTypes.THEME_CHANGE,
        theme
    }
};

export const hideIntroAct = (): IntroHideAction => {
    return {
        type: ActionTypes.INTRO_HIDE,
    }
};
