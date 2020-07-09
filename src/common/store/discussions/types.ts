import {Entry} from "../entries/types";

export interface Discussions {
    list: Record<string, Entry>;
    loading: boolean;
    error: boolean;
}

export enum ActionTypes {
    FETCH = "@discussions/FETCH",
    FETCHED = "@discussions/FETCHED",
    FETCH_ERROR = "@discussions/FETCH_ERROR",
    RESET = "@discussions/RESET",
}

export interface FetchAction {
    type: ActionTypes.FETCH;
}

export interface FetchedAction {
    type: ActionTypes.FETCHED;
    list: Record<string, Entry>;
}

export interface FetchErrorAction {
    type: ActionTypes.FETCH_ERROR;
}

export interface ResetAction {
    type: ActionTypes.RESET;
}

export type Actions = FetchAction | FetchedAction | FetchErrorAction | ResetAction;
