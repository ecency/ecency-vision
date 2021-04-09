import {LoginAction, LogoutAction} from "../active-user/types";

export interface Reblog {
    author: string;
    permlink: string;
}

export interface Reblogs {
    list: Reblog[],
    canFetch: boolean
}

export enum ActionTypes {
    FETCH = "@reblogs/FETCH",
    FETCHED = "@reblogs/FETCHED",
    FETCH_ERROR = "@reblogs/FETCH_ERROR",
    ADD = "@reblogs/ADD",
    DELETE = "@reblogs/DELETE",
}

export interface FetchAction {
    type: ActionTypes.FETCH;
}

export interface FetchedAction {
    type: ActionTypes.FETCHED;
    items: Reblog[]
}

export interface FetchErrorAction {
    type: ActionTypes.FETCH_ERROR;
}

export interface AddAction {
    type: ActionTypes.ADD;
    item: Reblog
}

export interface DeleteAction {
    type: ActionTypes.DELETE;
    item: Reblog
}

export type Actions = FetchAction | FetchedAction | FetchErrorAction | AddAction | DeleteAction | LoginAction | LogoutAction;
