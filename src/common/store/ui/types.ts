export interface UI {
    login: boolean;
    signUp: boolean;
    notifications: boolean
}

export enum ActionTypes {
    TOGGLE_LOGIN = "@ui/TOGGLE-LOGIN",
    TOGGLE_SIGN_UP = "@users/TOGGLE_SIGN_UP",
    TOGGLE_NOTIFICATIONS = "@users/TOGGLE_NOTIFICATIONS"
}

export interface ToggleLoginAct {
    type: ActionTypes.TOGGLE_LOGIN;
}

export interface ToggleSignUpAct {
    type: ActionTypes.TOGGLE_SIGN_UP;
}

export interface ToggleNotificationsAct {
    type: ActionTypes.TOGGLE_NOTIFICATIONS;
}

export type Actions = ToggleLoginAct | ToggleSignUpAct | ToggleNotificationsAct;


export type ToggleType = "login" | "signUp" | "notifications"
