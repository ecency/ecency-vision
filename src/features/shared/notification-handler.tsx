"use client";

import React, { useEffect, useRef, useState } from "react";
import { NotificationsWebSocket } from "@/api/notifications-ws-api";
import useMount from "react-use/lib/useMount";
import { useGlobalStore } from "@/core/global-store";
import { NotifyTypes } from "@/enums";
import { usePrevious } from "react-use";

export function NotificationHandler() {
  const nws = useRef(new NotificationsWebSocket());

  const [countInterval, setCountInterval] = useState<any>();

  const activeUser = useGlobalStore((state) => state.activeUser);
  const notifications = useGlobalStore((state) => state.notifications);
  const uiNotifications = useGlobalStore((state) => state.uiNotifications);
  const globalNotifications = useGlobalStore((state) => state.globalNotifications);
  const fetchNotifications = useGlobalStore((state) => state.fetchNotifications);
  const fetchNotificationsSettings = useGlobalStore((state) => state.fetchNotificationsSettings);
  const fetchUnreadNotificationCount = useGlobalStore(
    (state) => state.fetchUnreadNotificationCount
  );
  const toggleUIProp = useGlobalStore((state) => state.toggleUiProp);

  const previousActiveUser = usePrevious(activeUser);

  useMount(() => {
    nws.current
      .withActiveUser(activeUser)
      .withCallbackOnMessage(() => {
        fetchUnreadNotificationCount();
        fetchNotifications(null);
      })
      .withToggleUi(toggleUIProp)
      .setHasUiNotifications(uiNotifications)
      .setHasNotifications(globalNotifications)
      .setEnabledNotificationsTypes((notifications.settings?.notify_types as NotifyTypes[]) || []);

    if (activeUser) {
      fetchNotificationsSettings(activeUser!!.username);
    }
    if (activeUser && notifications.unreadFetchFlag) {
      fetchUnreadNotificationCount();
    }
  });

  useEffect(() => {
    nws.current.setEnabledNotificationsTypes(
      (notifications.settings?.notify_types as NotifyTypes[]) || []
    );
  }, [notifications, nws]);

  useEffect(() => {
    if (!activeUser && countInterval) {
      clearInterval(countInterval);
    }

    if (notifications.fbSupport === "granted" && activeUser && !countInterval) {
      setCountInterval(setInterval(() => fetchUnreadNotificationCount(), 60000));
    }

    if (notifications.fbSupport === "denied" && activeUser) {
      nws.current.disconnect();
      nws.current.withActiveUser(activeUser).connect();
    }

    if (!previousActiveUser && activeUser && activeUser.username) {
      nws.current.disconnect();
      if (notifications.fbSupport === "denied") {
        nws.current.withActiveUser(activeUser).connect();
      }
      fetchUnreadNotificationCount();
    }

    if (activeUser?.username !== previousActiveUser?.username) {
      nws.current.disconnect();
      if (notifications.fbSupport === "denied") {
        nws.current.withActiveUser(activeUser).connect();
      }

      if (activeUser) {
        fetchNotificationsSettings(activeUser!!.username);
        fetchUnreadNotificationCount();
      }
    }
  }, [activeUser, countInterval, notifications, previousActiveUser]);

  return <></>;
}
