import {Dispatch} from 'redux';

import defaults from '../../../constants/defaults.json';
import filters from '../../../constants/filters.json';
import themes from '../../../constants/themes.json';

import {AppState} from '../index';

import {Actions, ActionTypes, State, ThemeChangeAction, IntroHideAction} from './types';

import filterTagExtract from '../../../helper/filter-tag-extract';

import {lsGet, lsSet} from "../../../util/ls";

const readTheme = (): string => {
    const userTheme = lsGet('theme');
    if (userTheme === null) {
        return defaults.theme;
    }

    return themes.includes(userTheme) ? userTheme : defaults.theme;
};

const readIntro = (): boolean => {
    const val = lsGet('hide-intro');
    return !val;
};

export const initialState: State = {
    filter: defaults.filter,
    tag: '',
    theme: readTheme(),
    intro: readIntro()
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

    lsSet('theme', newTheme);

    dispatch(themeChangeAct(newTheme));
};

export const hideIntro = () => (dispatch: Dispatch) => {
    lsSet('hide-intro', '1');
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
