import {LoginAction, LogoutAction} from "../active-user/types";

import {LocationChangeAction} from "../common";

export type EntryPinTracker = Record<string, boolean>;

export enum ActionTypes {
    FETCH = "@entry-pin-tracker/FETCH",
    FETCHED = "@entry-pin-tracker/FETCHED",
    SET = "@entry-pin-tracker/SET"
}

export interface FetchAction {
    type: ActionTypes.FETCH;
    author: string;
    permlink: string
}

export interface SetAction {
    type: ActionTypes.SET;
    author: string;
    permlink: string;
    pinned: boolean
}

export type Actions = FetchAction | SetAction | LoginAction | LogoutAction | LocationChangeAction;
