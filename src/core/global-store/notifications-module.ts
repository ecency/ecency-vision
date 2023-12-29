import { ApiNotificationSetting, Notifications } from "@/entities";
import { ActiveUserState } from "@/core/global-store/active-user-module";
import {
  getNotifications,
  getNotificationSetting,
  getUnreadNotificationCount,
  saveNotificationsSettings
} from "@/api/private-api";
import { isSupported } from "@firebase/messaging";
import { getFcmToken, initFirebase, listenFCM } from "@/api/firebase";
import * as ls from "@/utils/local-storage";
import { NotifyTypes } from "@/enums";
import { playNotificationSound } from "@/utils";

export function createNotificationsState() {
  return {
    notifications: {
      filter: null,
      unread: 0,
      list: [],
      loading: false,
      hasMore: false,
      unreadFetchFlag: false,
      fbSupport: "pending"
    } as Notifications
  };
}

type State = ReturnType<typeof createNotificationsState> & ActiveUserState;

const fetchUnreadNotificationCount = async (
  set: (state: Partial<State>) => void,
  getState: () => State
) => {
  const { activeUser } = getState();
  const count = await getUnreadNotificationCount(activeUser?.username!);
  set({
    notifications: {
      ...getState().notifications,
      unread: count
    }
  });
};

const fetchNotifications = async (
  since: string | null = null,
  set: (state: Partial<State>) => void,
  getState: () => State
) => {
  const { notifications } = getState();

  if (notifications.loading) {
    return;
  }

  if (since) {
    set({
      notifications: {
        ...getState().notifications,
        loading: true
      }
    });
  } else {
    set({
      notifications: {
        ...getState().notifications,
        list: [],
        loading: true
      }
    });
  }

  const { activeUser } = getState();
  const { filter } = notifications;

  try {
    const r = await getNotifications(activeUser?.username!, filter, since);
    if (since) {
      set({
        notifications: {
          ...getState().notifications,
          loading: false
        }
      });
    } else {
      set({
        notifications: {
          ...getState().notifications,
          list: [...getState().notifications.list, ...r],
          loading: false
        }
      });
    }
  } catch (e) {
    set({
      notifications: {
        ...getState().notifications,
        list: [],
        loading: false
      }
    });
  }
};

const updateNotificationsSettings = async (
  username: string,
  token: string | undefined,
  set: (state: Partial<State>) => void,
  getState: () => State
) => {
  const notifyTypes = getState().notifications.settings?.notify_types || [];
  const settings = await saveNotificationsSettings(
    username,
    notifyTypes,
    getState().notifications.settings?.allows_notify === 1,
    token || ls.get("fb-notifications-token") || username + "-web"
  );
  set({
    notifications: {
      ...getState().notifications,
      settings
    }
  });
};

const fetchNotificationsSettings = async (
  username: string,
  set: (state: Partial<State>) => void,
  getState: () => State
) => {
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
      set({
        notifications: {
          ...getState().notifications,
          settings
        }
      });
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
      set({
        notifications: {
          ...getState().notifications,
          settings
        }
      });
      ls.remove("notifications");

      updateNotificationsSettings(username, token, set, getState);
    }

    if (permission === "granted") {
      if (oldToken !== token) {
        updateNotificationsSettings(username, token, set, getState);
        ls.set("fb-notifications-token", token);
      }

      if (isFbMessagingSupported) {
        listenFCM(() => {
          playNotificationSound();
          fetchUnreadNotificationCount(set, getState);
          fetchNotifications(null, set, getState);
        });
      }
    }

    set({
      notifications: {
        ...getState().notifications,
        fbSupport: isFbMessagingSupported ? "granted" : "denied"
      }
    });
  }
};

export function createNotificationsActions(
  set: (state: Partial<State>) => void,
  getState: () => State
) {
  return {
    fetchUnreadNotificationCount: () => fetchUnreadNotificationCount(set, getState),
    fetchNotifications: (since: string | null) => fetchNotifications(since, set, getState),
    fetchNotificationsSettings: (username: string) =>
      fetchNotificationsSettings(username, set, getState)
  };
}
