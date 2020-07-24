import {Dispatch} from "redux";

import {
    Actions,
    ActionTypes,
    ApiNotification,
    FetchAction,
    FetchedAction,
    FetchErrorAction,
    NotificationFilter,
    Notifications,
    ResetAction,
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
        case ActionTypes.RESET: {
            return {...initialState}
        }
        case ActionTypes.SET_FILTER: {
            return {
                ...state,
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
    const {notifications, activeUser} = getState();

    const {filter} = notifications;

    getNotifications(activeUser?.username!, filter, since).then(r => {
        dispatch(fetchedAct(r));
    }).catch(() => {
        dispatch(fetchErrorAct());
    });
}
export const fetchUnreadNotificationCount = () => (dispatch: Dispatch, getState: () => AppState) => {
    const {activeUser} = getState();

    getUnreadNotificationCount(activeUser?.username!).then(count => {
        setUnreadCountAct(count);
    })
}

export const resetNotifications = () => (dispatch: Dispatch) => {
    dispatch(resetAct());
};

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

export const resetAct = (): ResetAction => {
    return {
        type: ActionTypes.RESET,
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
