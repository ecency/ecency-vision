import {Dispatch} from "redux";

import {ActionTypes as ActiveUserActionTypes} from "../active-user/types"

import {
    Actions,
    ActionTypes,
    ApiNotification,
    FetchAction,
    FetchedAction,
    FetchErrorAction,
    NotificationFilter,
    Notifications,
    SetFilterAction,
    SetUnreadCountAction
} from "./types";

import {AppState} from "../index";

import {getNotifications, getUnreadNotificationCount} from "../../api/private";

export const initialState: Notifications = {
    filter: null,
    unread: 0,
    list: [],
    loading: false,
    error: false,
};

export default (state: Notifications = initialState, action: Actions): Notifications => {
    switch (action.type) {
        case ActionTypes.FETCH: {
            return {
                ...state,
                loading: true,
            };
        }
        case ActionTypes.FETCHED: {
            const {list} = state;
            const newList = [...list, ...action.list];
            return {
                ...state,
                loading: false,
                error: false,
                list: newList
            };
        }
        case ActionTypes.FETCH_ERROR: {
            return {
                ...state,
                loading: false,
                error: true
            };
        }
        case ActiveUserActionTypes.LOGIN:
        case ActiveUserActionTypes.LOGOUT: {
            return {...initialState}
        }
        case ActionTypes.SET_FILTER: {
            return {
                ...state,
                list:[],
                filter: action.filter
            };
        }
        case ActionTypes.SET_UNREAD_COUNT: {
            return {
                ...state,
                unread: action.count
            };
        }
        default:
            return state;
    }
}

/* Actions */
export const fetchNotifications = (since: number | null = null) => (dispatch: Dispatch, getState: () => AppState) => {
    dispatch(fetchAct());
    const {notifications, activeUser, users} = getState();

    const {filter} = notifications;

    const user = users.find((x) => x.username === activeUser?.username)!;

    getNotifications(user, filter, since).then(r => {
        dispatch(fetchedAct(r));
    }).catch(() => {
        dispatch(fetchErrorAct());
    });
}
export const fetchUnreadNotificationCount = () => (dispatch: Dispatch, getState: () => AppState) => {
    const {activeUser, users} = getState();

    const user = users.find((x) => x.username === activeUser?.username)!;

    getUnreadNotificationCount(user).then(count => {
        dispatch(setUnreadCountAct(count));
    })
}

export const setNotificationsFilter = (filter: NotificationFilter | null) => (dispatch: Dispatch) => {
    dispatch(setFilterAct(filter));
}

/* Action Creators */
export const fetchAct = (): FetchAction => {
    return {
        type: ActionTypes.FETCH,
    };
};

export const fetchedAct = (list: ApiNotification[]): FetchedAction => {
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

export const setFilterAct = (filter: NotificationFilter | null): SetFilterAction => {
    return {
        type: ActionTypes.SET_FILTER,
        filter
    };
};

export const setUnreadCountAct = (count: number): SetUnreadCountAction => {
    return {
        type: ActionTypes.SET_UNREAD_COUNT,
        count
    };
};
