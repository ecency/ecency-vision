import {LoginAction, LogoutAction} from "../active-user/types";

import {LocationChangeAction} from "../common";

export interface EntryPinTracker {
    pinned: boolean;
    canFetch: boolean;
}

export enum ActionTypes {
    FETCH = "@entry-pin-tracker/FETCH",
    FETCHED = "@entry-pin-tracker/FETCHED",
    SET = "@entry-pin-tracker/SET"
}

export interface FetchAction {
    type: ActionTypes.FETCH;
}

export interface SetAction {
    type: ActionTypes.SET;
    pinned: boolean
}

export type Actions = FetchAction | SetAction | LoginAction | LogoutAction | LocationChangeAction;
