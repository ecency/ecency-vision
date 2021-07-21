import {Dispatch} from "redux";

import {AppState} from "../index";
import {Entry} from "../entries/types";

import {Actions, ActionTypes, Discussion, FetchAction, FetchedAction, FetchErrorAction, ResetAction, SetOrderAction, SortOrder,} from "./types";

import {clone} from '../util';
import sorter from './sorter';

import {getDiscussion} from "../../api/bridge";


export const initialState: Discussion = {
    list: [],
    loading: false,
    error: false,
    order: SortOrder.trending
};

export default (state: Discussion = initialState, action: Actions): Discussion => {
    switch (action.type) {
        case ActionTypes.FETCH: {
            return {
                ...state,
                list: [],
                loading: true,
                error: false,
            };
        }
        case ActionTypes.FETCHED: {
            return {
                ...state,
                list: action.list,
                loading: false,
                error: false,
            };
        }
        case ActionTypes.FETCH_ERROR: {
            return {
                ...state,
                list: [],
                loading: false,
                error: true,
            };
        }
        case ActionTypes.RESET: {
            return {...initialState};
        }
        case ActionTypes.SET_ORDER: {
            return {
                ...state,
                list: action.list,
                order: action.order,
                loading: false,
                error: false,
            };
        }
        default:
            return state;
    }
};

/* Actions */
export const fetchDiscussion = (parent_author: string, parent_permlink: string) => (dispatch: Dispatch, getState: () => AppState) => {
    dispatch(fetchAct());

    const {discussion} = getState();
    const {order} = discussion;

    getDiscussion(parent_author, parent_permlink)
        .then((resp) => {
            if (resp) {
                let list: Entry[] = [];

                for (const d in resp) {
                    list.push(resp[d]);
                }

                sorter(list, SortOrder[order]);

                dispatch(fetchedAct(clone(list)));
            } else {
                dispatch(fetchErrorAct());
            }
        })
        .catch(() => {
            dispatch(fetchErrorAct());
        });
};

export const sortDiscussion = (order: SortOrder) => (dispatch: Dispatch, getState: () => AppState) => {
    const {discussion} = getState();
    const list = clone(discussion.list);

    sorter(list, SortOrder[order]);

    dispatch(setOrderAct(order, clone(list)));
};

export const resetDiscussion = () => (dispatch: Dispatch) => {
    dispatch(resetAct());
};

export const updateReply = (reply: Entry) => (dispatch: Dispatch, getState: () => AppState) => {
    const {discussion} = getState();
    const list: Entry[] = clone(discussion.list);

    const newList = list.map((x: Entry) => {
        if (x.author === reply.author && x.permlink === reply.permlink) {
            return reply;
        }

        return x;
    });

    dispatch(fetchedAct(newList));
}

export const addReply = (reply: Entry) => (dispatch: Dispatch, getState: () => AppState) => {
    const {discussion} = getState();
    const list: Entry[] = clone(discussion.list);
    const newList = [reply, ...list];
    dispatch(fetchedAct(newList));
}

export const deleteReply = (reply: Entry) => (dispatch: Dispatch, getState: () => AppState) => {
    const {discussion} = getState();
    const list: Entry[] = clone(discussion.list);

    const newList = list.filter((x: Entry) => {
        return !(x.author === reply.author && x.permlink === reply.permlink)
    });
    dispatch(fetchedAct(newList));
}

/* Action Creators */
export const fetchAct = (): FetchAction => {
    return {
        type: ActionTypes.FETCH,
    };
};

export const fetchedAct = (list: Entry[]): FetchedAction => {
    return {
        type: ActionTypes.FETCHED,
        list,
    };
};

export const fetchErrorAct = (): FetchErrorAction => {
    return {
        type: ActionTypes.FETCH_ERROR,
    };
};

export const resetAct = (): ResetAction => {
    return {
        type: ActionTypes.RESET,
    };
};

export const setOrderAct = (order: SortOrder, list: Entry[]): SetOrderAction => {
    return {
        type: ActionTypes.SET_ORDER,
        list,
        order
    };
};
