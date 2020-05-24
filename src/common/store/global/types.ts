export interface State {
    filter: string,
    tag: string,
    theme: string,
    intro: boolean
}

export enum ActionTypes {
    INIT = '@@INIT',
    LOCATION_CHANGE = '@@router/LOCATION_CHANGE',
    THEME_CHANGE = '@global/THEME_CHANGE',
    INTRO_HIDE = '@global/INTRO_HIDE',
}

export interface InitAction {
    type: ActionTypes.INIT;
}

export interface LocationChangeAction {
    type: ActionTypes.LOCATION_CHANGE;
}


export interface ThemeChangeAction {
    type: ActionTypes.THEME_CHANGE;
    theme: string;
}

export interface IntroHideAction {
    type: ActionTypes.INTRO_HIDE;
}


export type Actions = InitAction | LocationChangeAction | ThemeChangeAction | IntroHideAction
