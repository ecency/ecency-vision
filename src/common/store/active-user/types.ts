import {Account} from "../accounts/types";

export interface UserPoints {
    points: string;
    uPoints: string;
}

export interface ActiveUser {
    username: string;
    data: Account;
    points: UserPoints;
}

export enum ActionTypes {
    LOGIN = "@active-user/LOGIN",
    LOGOUT = "@active-user/LOGOUT",
    UPDATE = "@active-user/UPDATE",
}

export interface LoginAction {
    type: ActionTypes.LOGIN;
}

export interface LogoutAction {
    type: ActionTypes.LOGOUT;
}

export interface UpdateAction {
    type: ActionTypes.UPDATE;
    data: Account;
    points: UserPoints
}

export type Actions = LoginAction | LogoutAction | UpdateAction;
