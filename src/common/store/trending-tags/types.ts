import {TrendingTag} from '../../api/hive';

export interface State {
    list: TrendingTag[],
    loading: boolean,
    error: boolean
}

export enum ActionTypes {
    FETCH = '@trending-tags/FETCH',
    FETCHED = '@trending-tags/FETCHED',
    FETCH_ERROR = '@trending-tags/FETCH_ERROR',
}

export interface FetchAction {
    type: ActionTypes.FETCH;
}

export interface FetchedAction {
    type: ActionTypes.FETCHED;
    tags: TrendingTag[]
}

export interface FetchErrorAction {
    type: ActionTypes.FETCH_ERROR;
}

export type Actions = FetchAction | FetchedAction | FetchErrorAction;
