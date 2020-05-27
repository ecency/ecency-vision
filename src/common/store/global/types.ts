import {LocationChangeAction} from '../common';

export interface State {
    filter: string,
    tag: string,
    theme: string,
    intro: boolean,
    currency: string,
    currencyRate: number,
    currencySymbol: string
}

export enum ActionTypes {
    THEME_CHANGE = '@global/THEME_CHANGE',
    INTRO_HIDE = '@global/INTRO_HIDE',
}

export interface ThemeChangeAction {
    type: ActionTypes.THEME_CHANGE;
    theme: string;
}

export interface IntroHideAction {
    type: ActionTypes.INTRO_HIDE;
}


export type Actions = LocationChangeAction | ThemeChangeAction | IntroHideAction
