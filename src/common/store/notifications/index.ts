import {Dispatch} from "redux";

import {ActionTypes as ActiveUserActionTypes} from "../active-user/types"

import {
    Actions,
    ActionTypes,
    ApiNotification,
    FetchAction,
    FetchedAction,
    MarkAction,
    NFetchMode,
    NotificationFilter,
    Notifications,
    SetFilterAction,
    SetUnreadCountAction
} from "./types";

import {AppState} from "../index";

import {getNotifications, getUnreadNotificationCount, markNotifications as markNotificationsFn} from "../../api/private-api";

export const initialState: Notifications = {
    filter: null,
    unread: 0,
    list: [],
    loading: false,
    hasMore: true,
    unreadFetchFlag: true
};

export default (state: Notifications = initialState, action: Actions): Notifications => {
    switch (action.type) {
        case ActionTypes.FETCH: {
            switch (action.mode) {
                case NFetchMode.APPEND:
                    return {
                        ...state,
                        loading: true,
                    };
                case NFetchMode.REPLACE:
                    return {
                        ...state,
                        list: [],
                        loading: true,
                    };
                default:
                    return state;
            }
        }
        case ActionTypes.FETCHED: {
            const {list} = state;
            let newList: ApiNotification[] = []

            switch (action.mode) {
                case NFetchMode.APPEND:
                    newList = [...list, ...action.list];
                    break;
                case NFetchMode.REPLACE:
                    newList = [...action.list];
                    break;
            }

            return {
                ...state,
                loading: false,
                list: newList,
                hasMore: action.list.length === 50 // Api list size
            };
        }
        case ActiveUserActionTypes.LOGIN:
        case ActiveUserActionTypes.LOGOUT: {
            return {...initialState}
        }
        case ActionTypes.SET_FILTER: {
            return {
                ...state,
                list: [],
                hasMore: true,
                filter: action.filter
            };
        }
        case ActionTypes.SET_UNREAD_COUNT: {
            return {
                ...state,
                unread: action.count,
                unreadFetchFlag: false
            };
        }
        case ActionTypes.MARK: {
            let newList: ApiNotification[];

            if (action.id) {
                // mark specific
                newList = state.list.map(x => {
                    if (x.id === action.id) {
                        return {...x, read: 1};
                    }

                    return {...x};
                })
            } else {
                // mark all
                newList = state.list.map((x) => {
                    return {...x, read: 1};
                })
            }

            return {
                ...state,
                list: newList
            };
        }
        default:
            return state;
    }
}

/* Actions */
export const fetchNotifications = (since: string | null = null) => (dispatch: Dispatch, getState: () => AppState) => {
    const {notifications} = getState();

    if (notifications.loading) {
        return;
    }

    if (since) {
        dispatch(fetchAct(NFetchMode.APPEND));
    } else {
        dispatch(fetchAct(NFetchMode.REPLACE));
    }

    const {activeUser} = getState();

    const {filter} = notifications;

    getNotifications(activeUser?.username!, filter, since).then(r => {

        if (since) {
            dispatch(fetchedAct(r, NFetchMode.APPEND));
        } else {
            dispatch(fetchedAct(r, NFetchMode.REPLACE));
        }

    }).catch(() => {
        dispatch(fetchedAct([], NFetchMode.APPEND));
    });
}

export const fetchUnreadNotificationCount = () => (dispatch: Dispatch, getState: () => AppState) => {
    const {activeUser} = getState();

    getUnreadNotificationCount(activeUser?.username!).then(count => {
        dispatch(setUnreadCountAct(count));
    })
}

export const setNotificationsFilter = (filter: NotificationFilter | null) => (dispatch: Dispatch) => {
    dispatch(setFilterAct(filter));
}

export const markNotifications = (id: string | null) => (dispatch: Dispatch, getState: () => AppState) => {
    dispatch(markAct(id));

    const {activeUser} = getState();

    markNotificationsFn(activeUser?.username!, id).then(() => {
        return getUnreadNotificationCount(activeUser?.username!)
    }).then(count => {
        dispatch(setUnreadCountAct(count));
    })
}

/* Action Creators */
export const fetchAct = (mode: NFetchMode): FetchAction => {
    return {
        type: ActionTypes.FETCH,
        mode
    };
};

export const fetchedAct = (list: ApiNotification[], mode: NFetchMode): FetchedAction => {
    return {
        type: ActionTypes.FETCHED,
        list,
        mode
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

export const markAct = (id: string | null): MarkAction => {
    return {
        type: ActionTypes.MARK,
        id
    };
}
