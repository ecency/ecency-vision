import {Dispatch} from 'redux';

import {getTrendingTags} from '../../api/hive';

import {AppState} from '../index';

import {Actions, ActionTypes, State, FetchAction, FetchedAction, FetchErrorAction} from './types';


export const initialState: State = {
    list: [],
    loading: false,
    error: false
};

export default (state: State = initialState, action: Actions): State => {
    switch (action.type) {
        case ActionTypes.FETCH: {
            return {
                list: [],
                loading: true,
                error: false
            };
        }
        case ActionTypes.FETCHED: {
            return {
                list: action.tags,
                loading: false,
                error: false
            };
        }
        case ActionTypes.FETCH_ERROR: {
            return {
                list: [],
                loading: false,
                error: true
            };
        }
        default:
            return state;
    }
}

/* Actions */
export const fetchTrendingTags = (afterTag: string = '', limit: number = 100) =>
    (dispatch: Dispatch, getState: () => AppState) => {
        const {trendingTags} = getState();

        if (trendingTags.list.length >= 1 || trendingTags.loading) {
            return;
        }

        dispatch(fetchAct());

        return getTrendingTags(afterTag, limit).then(tags => {
            dispatch(fetchedAct(tags));
            return tags
        }).catch(() => {
            dispatch(fetchErrorAct());
        });
    };

/* Action Creators */
export const fetchAct = (): FetchAction => {
    return {
        type: ActionTypes.FETCH
    }
};

export const fetchedAct = (tags: string[]): FetchedAction => {
    return {
        type: ActionTypes.FETCHED,
        tags
    }
};

export const fetchErrorAct = (): FetchErrorAction => {
    return {
        type: ActionTypes.FETCH_ERROR
    }
};
