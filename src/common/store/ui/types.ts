export interface UI {
    login: boolean;
    signUp: boolean;
}

export enum ActionTypes {
    TOGGLE_LOGIN = "@ui/TOGGLE-LOGIN",
    TOGGLE_SIGN_UP = "@users/TOGGLE_SIGN_UP",
}

export interface ToggleLoginAct {
    type: ActionTypes.TOGGLE_LOGIN;
}

export interface ToggleSignUpAct {
    type: ActionTypes.TOGGLE_SIGN_UP;
}


export type Actions = ToggleLoginAct | ToggleSignUpAct;
