export interface UI {
    login: boolean;
    signUp: boolean;
    notifications: boolean,
    gallery: boolean
}

export enum ActionTypes {
    TOGGLE_LOGIN = "@ui/TOGGLE-LOGIN",
    TOGGLE_SIGN_UP = "@users/TOGGLE_SIGN_UP",
    TOGGLE_NOTIFICATIONS = "@users/TOGGLE_NOTIFICATIONS",
    TOGGLE_GALLERY = "@ui/TOGGLE_GALLERY",
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

export interface ToggleGalleryAct {
    type: ActionTypes.TOGGLE_GALLERY;
}

export type Actions = ToggleLoginAct | ToggleSignUpAct | ToggleNotificationsAct | ToggleGalleryAct;


export type ToggleType = "login" | "signUp" | "notifications" | "gallery"
