import { Dispatch } from "redux";

import { ActionTypes as ActiveUserActionTypes } from "../active-user/types";

import {
  Actions,
  ActionTypes,
  ApiNotification,
  ApiNotificationSetting,
  FetchAction,
  FetchedAction,
  MarkAction,
  NFetchMode,
  NotificationFilter,
  Notifications,
  SetFbSupportedAction,
  SetFilterAction,
  SetSettingsAction,
  SetSettingsAllowNotifyAction,
  SetSettingsItemAction,
  SetUnreadCountAction
} from "./types";

import { AppState } from "../index";

import {
  getNotifications,
  getNotificationSetting,
  getUnreadNotificationCount,
  markNotifications as markNotificationsFn,
  saveNotificationsSettings
} from "../../api/private-api";
import { NotifyTypes } from "../../enums";
import * as ls from "../../util/local-storage";
import { getFcmToken, initFirebase, listenFCM } from "../../api/firebase";
import { isSupported } from "@firebase/messaging";
import { playNotificationSound } from "../../util/play-notification-sound";

export const initialState: Notifications = {
  filter: null,
  unread: 0,
  list: [],
  loading: false,
  hasMore: true,
  unreadFetchFlag: true,
  fbSupport: "pending"
};

export default (state: Notifications = initialState, action: Actions): Notifications => {
  switch (action.type) {
    case ActionTypes.FETCH: {
      switch (action.mode) {
        case NFetchMode.APPEND:
          return {
            ...state,
            loading: true
          };
        case NFetchMode.REPLACE:
          return {
            ...state,
            list: [],
            loading: true
          };
        default:
          return state;
      }
    }
    case ActionTypes.FETCHED: {
      const { list } = state;
      let newList: ApiNotification[] = [];

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
      return { ...initialState };
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
        newList = state.list.map((x) => {
          if (x.id === action.id) {
            return { ...x, read: 1 };
          }

          return { ...x };
        });
      } else {
        // mark all
        newList = state.list.map((x) => {
          return { ...x, read: 1 };
        });
      }

      return {
        ...state,
        list: newList
      };
    }
    case ActionTypes.SET_SETTINGS:
      return {
        ...state,
        settings: action.settings
      };
    case ActionTypes.SET_SETTINGS_ITEM:
      const types = state.settings?.notify_types || [];
      const nextTypes = types.includes(action.settingsType as number)
        ? types.filter((t) => t !== action.settingsType)
        : [...types, action.settingsType];
      return {
        ...state,
        settings: {
          ...state.settings,
          notify_types: nextTypes,
          allows_notify: nextTypes.length > 0 ? 1 : 0
        } as ApiNotificationSetting
      };
    case ActionTypes.SET_SETTINGS_ALLOW_NOTIFY:
      return {
        ...state,
        settings: {
          ...state.settings,
          allows_notify: action.value ? 1 : 0
        } as ApiNotificationSetting
      };
    case ActionTypes.SET_FB_SUPPORTED:
      return {
        ...state,
        fbSupport: action.value
      };
    default:
      return state;
  }
};

/* Actions */
export const fetchNotifications =
  (since: string | null = null) =>
  (dispatch: Dispatch, getState: () => AppState) => {
    const { notifications } = getState();

    if (notifications.loading) {
      return;
    }

    if (since) {
      dispatch(fetchAct(NFetchMode.APPEND));
    } else {
      dispatch(fetchAct(NFetchMode.REPLACE));
    }

    const { activeUser } = getState();

    const { filter } = notifications;

    getNotifications(activeUser?.username!, filter, since)
      .then((r) => {
        if (since) {
          dispatch(fetchedAct(r, NFetchMode.APPEND));
        } else {
          dispatch(fetchedAct(r, NFetchMode.REPLACE));
        }
      })
      .catch(() => {
        dispatch(fetchedAct([], NFetchMode.APPEND));
      });
  };

export const fetchUnreadNotificationCount =
  () => (dispatch: Dispatch, getState: () => AppState) => {
    const { activeUser } = getState();

    getUnreadNotificationCount(activeUser?.username!).then((count) => {
      dispatch(setUnreadCountAct(count));
    });
  };

export const setNotificationsFilter =
  (filter: NotificationFilter | null) => (dispatch: Dispatch) => {
    dispatch(setFilterAct(filter));
  };

export const markNotifications =
  (id: string | null) => (dispatch: Dispatch, getState: () => AppState) => {
    dispatch(markAct(id));

    const { activeUser } = getState();

    markNotificationsFn(activeUser?.username!, id)
      .then(() => {
        return getUnreadNotificationCount(activeUser?.username!);
      })
      .then((count) => {
        dispatch(setUnreadCountAct(count));
      });
  };

export const setNotificationsSettingsItem =
  (type: NotifyTypes, value: boolean) => (dispatch: Dispatch, getState: () => AppState) => {
    if (type === NotifyTypes.ALLOW_NOTIFY) {
      const isEnabled = getState().notifications.settings?.allows_notify === 1;
      dispatch(setSettingsAllowAllAct(!isEnabled));
      dispatch(
        setSettingsAct({
          ...(getState().notifications.settings || {}),
          notify_types: !isEnabled
            ? [
                NotifyTypes.COMMENT,
                NotifyTypes.FOLLOW,
                NotifyTypes.VOTE,
                NotifyTypes.MENTION,
                NotifyTypes.FAVORITES,
                NotifyTypes.BOOKMARKS,
                NotifyTypes.RE_BLOG,
                NotifyTypes.TRANSFERS
              ]
            : []
        } as ApiNotificationSetting)
      );
      return;
    }

    dispatch(setSettingsItemAct(type, value));
  };

export const updateNotificationsSettings =
  (username: string, token?: string) => async (dispatch: Dispatch, getState: () => AppState) => {
    const notifyTypes = getState().notifications.settings?.notify_types || [];
    const settings = await saveNotificationsSettings(
      username,
      notifyTypes,
      getState().notifications.settings?.allows_notify === 1,
      token || ls.get("fb-notifications-token") || username + "-web"
    );
    dispatch(setSettingsAct(settings));
  };

/**
 * Fetch notifications settings from a backend with an existing firebase token
 * * Token will be created each time then We have to store old token in a local storage
 * to getting existing settings
 * @param username
 */
export const fetchNotificationsSettings =
  (username: string) => async (dispatch: Dispatch, getState: () => AppState) => {
    let isFbMessagingSupported = await isSupported();
    initFirebase(isFbMessagingSupported);
    let token = username + "-web";
    let oldToken = ls.get("fb-notifications-token");
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted" && isFbMessagingSupported) {
        try {
          token = await getFcmToken();
        } catch (e) {
          isFbMessagingSupported = false;
          oldToken = null;
        }
      }

      try {
        const settings = await getNotificationSetting(username, oldToken || token);
        dispatch(setSettingsAct(settings));
      } catch (e) {
        const wasMutedPreviously = ls.get("notifications") === false;
        const settings = {
          ...(getState().notifications.settings as ApiNotificationSetting),
          notify_types: wasMutedPreviously
            ? []
            : ([
                NotifyTypes.COMMENT,
                NotifyTypes.FOLLOW,
                NotifyTypes.MENTION,
                NotifyTypes.FAVORITES,
                NotifyTypes.BOOKMARKS,
                NotifyTypes.VOTE,
                NotifyTypes.RE_BLOG,
                NotifyTypes.TRANSFERS
              ] as number[])
        };
        dispatch(setSettingsAct(settings));
        ls.remove("notifications");

        // @ts-ignore
        dispatch(updateNotificationsSettings(username, token));
      }

      if (permission === "granted") {
        if (oldToken !== token) {
          // @ts-ignore
          dispatch(updateNotificationsSettings(username, token));
          ls.set("fb-notifications-token", token);
        }

        if (isFbMessagingSupported) {
          listenFCM(() => {
            playNotificationSound();
            // @ts-ignore
            dispatch(fetchUnreadNotificationCount());

            // @ts-ignore
            dispatch(fetchNotifications(null));
          });
        }
      }

      dispatch(setFbSupportedAct(isFbMessagingSupported ? "granted" : "denied"));
    }
  };

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
};

export const setSettingsAct = (settings: ApiNotificationSetting): SetSettingsAction => ({
  type: ActionTypes.SET_SETTINGS,
  settings
});

export const setSettingsItemAct = (
  settingsType: NotifyTypes,
  value: boolean
): SetSettingsItemAction => ({
  type: ActionTypes.SET_SETTINGS_ITEM,
  settingsType,
  value
});

export const setSettingsAllowAllAct = (value: boolean): SetSettingsAllowNotifyAction => ({
  type: ActionTypes.SET_SETTINGS_ALLOW_NOTIFY,
  value
});

export const setFbSupportedAct = (
  value: "pending" | "granted" | "denied"
): SetFbSupportedAction => ({
  type: ActionTypes.SET_FB_SUPPORTED,
  value
});
