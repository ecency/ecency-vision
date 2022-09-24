import {Entry} from "../entries/types";

export enum SortOrder {
    trending = "trending",
    author_reputation = "author_reputation",
    votes = "votes",
    created = "created",
}

export interface Discussion {
    list: Entry[];
    loading: boolean;
    error: boolean;
    order: SortOrder
}

export enum ActionTypes {
    FETCH = "@discussions/FETCH",
    FETCHED = "@discussions/FETCHED",
    FETCH_ERROR = "@discussions/FETCH_ERROR",
    RESET = "@discussions/RESET",
    SET_ORDER = "@discussions/SET_ORDER",
}

export interface FetchAction {
    type: ActionTypes.FETCH;
}

export interface FetchedAction {
    type: ActionTypes.FETCHED;
    list: Entry[];
}

export interface FetchErrorAction {
    type: ActionTypes.FETCH_ERROR;
}

export interface ResetAction {
    type: ActionTypes.RESET;
}

export interface SetOrderAction {
    type: ActionTypes.SET_ORDER;
    list: Entry[];
    order: SortOrder;
}

export type Actions = FetchAction | FetchedAction | FetchErrorAction | ResetAction | SetOrderAction;
