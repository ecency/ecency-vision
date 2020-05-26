import {Discussion} from '@esteemapp/dhive';
import {LocationChangeAction} from '../common';

export interface EntryGroup {
    entries: Discussion[],
    error: Error | null,
    loading: boolean,
    hasMore: boolean
}

export interface State extends Record<string, EntryGroup> {
}


// TODO: Implement UPDATE action

export enum ActionTypes {
    FETCH = '@entries/FETCH',
    FETCHED = '@entries/FETCHED',
    FETCH_ERROR = '@entries/FETCH_ERROR',
    INVALIDATE = '@entries/INVALIDATE',
}

export interface FetchAction {
    type: ActionTypes.FETCH;
    groupKey: string;
}

export interface FetchErrorAction {
    type: ActionTypes.FETCH_ERROR;
    groupKey: string;
    error: Error;
}

export interface FetchedAction {
    type: ActionTypes.FETCHED;
    groupKey: string;
    entries: Discussion[];
    hasMore: boolean
}

export interface InvalidateAction {
    type: ActionTypes.INVALIDATE;
    groupKey: string;
}

export type Actions = LocationChangeAction | FetchAction | FetchedAction | FetchErrorAction | InvalidateAction ;

