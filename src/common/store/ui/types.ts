export interface UI {
    login: boolean;
    loginKc: boolean;
    notifications: boolean
}

export enum ActionTypes {
    TOGGLE_LOGIN = "@ui/TOGGLE-LOGIN",
    TOGGLE_LOGIN_KC = "@ui/TOGGLE-LOGIN-KC",
    TOGGLE_NOTIFICATIONS = "@users/TOGGLE_NOTIFICATIONS"
}

export interface ToggleLoginAct {
    type: ActionTypes.TOGGLE_LOGIN;
}

export interface ToggleLoginKcAct {
    type: ActionTypes.TOGGLE_LOGIN_KC;
}

export interface ToggleNotificationsAct {
    type: ActionTypes.TOGGLE_NOTIFICATIONS;
}

export type Actions = ToggleLoginAct | ToggleLoginKcAct | ToggleNotificationsAct;


export type ToggleType = "login" | "loginKc" | "notifications"
