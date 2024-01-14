"use client";

import React, { useEffect, useRef } from "react";
import { NotificationsWebSocket } from "@/api/notifications-ws-api";
import { useGlobalStore } from "@/core/global-store";
import { NotifyTypes } from "@/enums";
import { usePrevious } from "react-use";
import {
  useNotificationsQuery,
  useNotificationsSettingsQuery,
  useNotificationUnreadCountQuery
} from "@/api/queries";

export function NotificationHandler() {
  const nws = useRef(new NotificationsWebSocket());

  const activeUser = useGlobalStore((state) => state.activeUser);
  const uiNotifications = useGlobalStore((state) => state.uiNotifications);
  const globalNotifications = useGlobalStore((state) => state.globalNotifications);
  const toggleUIProp = useGlobalStore((state) => state.toggleUiProp);
  const fbSupport = useGlobalStore((state) => state.fbSupport);

  const previousActiveUser = usePrevious(activeUser);

  const notificationUnreadCountQuery = useNotificationUnreadCountQuery();
  const notificationsQuery = useNotificationsQuery(null);
  const notificationsSettingsQuery = useNotificationsSettingsQuery();

  useEffect(() => {
    nws.current
      .withActiveUser(activeUser)
      .withCallbackOnMessage(() => {
        notificationUnreadCountQuery.refetch();
        notificationsQuery.refetch();
      })
      .withToggleUi(toggleUIProp)
      .setHasUiNotifications(uiNotifications)
      .setHasNotifications(globalNotifications)
      .setEnabledNotificationsTypes(
        (notificationsSettingsQuery.data?.notify_types as NotifyTypes[]) || []
      );
  }, [activeUser]);

  useEffect(() => {
    nws.current.setEnabledNotificationsTypes(
      (notificationsSettingsQuery.data?.notify_types as NotifyTypes[]) || []
    );
  }, [notificationsSettingsQuery.data, nws]);

  useEffect(() => {
    if (fbSupport === "denied" && activeUser) {
      nws.current.disconnect();
      nws.current.withActiveUser(activeUser).connect();
    }

    if (!previousActiveUser && activeUser && activeUser.username) {
      nws.current.disconnect();
      if (fbSupport === "denied") {
        nws.current.withActiveUser(activeUser).connect();
      }
    }

    if (activeUser?.username !== previousActiveUser?.username) {
      nws.current.disconnect();
      if (fbSupport === "denied") {
        nws.current.withActiveUser(activeUser).connect();
      }
    }
  }, [activeUser, fbSupport, previousActiveUser]);

  return <></>;
}
