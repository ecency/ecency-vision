import {LocationChangeAction} from '../common';

export enum ListStyle {
    row = 'row',
    grid = 'grid'
}

export interface State {
    filter: string,
    tag: string,
    theme: string,
    listStyle: ListStyle,
    intro: boolean,
    currency: string,
    currencyRate: number,
    currencySymbol: string
}

export enum ActionTypes {
    THEME_CHANGE = '@global/THEME_CHANGE',
    INTRO_HIDE = '@global/INTRO_HIDE',
    LIST_STYLE_CHANGE = '@global/LIST_STYLE_CHANGE',
}

export interface ThemeChangeAction {
    type: ActionTypes.THEME_CHANGE;
    theme: string;
}

export interface IntroHideAction {
    type: ActionTypes.INTRO_HIDE;
}

export interface ListStyleChangeAction {
    type: ActionTypes.LIST_STYLE_CHANGE;
    listStyle: ListStyle;
}


export type Actions = LocationChangeAction | ThemeChangeAction | IntroHideAction | ListStyleChangeAction
