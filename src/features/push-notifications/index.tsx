"use client";

import { PropsWithChildren, useCallback, useEffect } from "react";
import { useGlobalStore } from "@/core/global-store";
import { isSupported } from "@firebase/messaging";
import { getFcmToken, initFirebase, listenFCM } from "@/api/firebase";
import * as ls from "@/utils/local-storage";
import { useNotificationsSettingsQuery, useNotificationUnreadCountQuery } from "@/api/queries";
import { playNotificationSound } from "@/utils";
import { useUpdateNotificationsSettings } from "@/api/mutations";
import usePrevious from "react-use/lib/usePrevious";

export function PushNotificationsProvider({ children }: PropsWithChildren) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const previousActiveUsr = usePrevious(activeUser);

  const setFbSupport = useGlobalStore((state) => state.setFbSupport);

  const notificationsSettingsQuery = useNotificationsSettingsQuery();
  const notificationUnreadCountQuery = useNotificationUnreadCountQuery();
  const updateNotificationsSettings = useUpdateNotificationsSettings();

  const init = useCallback(
    async (username: string) => {
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
          await notificationsSettingsQuery.refetch();
        } catch (e) {
          ls.remove("notifications");
        }

        if (permission === "granted") {
          if (oldToken !== token) {
            ls.set("fb-notifications-token", token);
            await updateNotificationsSettings.mutateAsync({
              notifyTypes: notificationsSettingsQuery.data?.notify_types ?? [],
              isEnabled: notificationsSettingsQuery.data.allows_notify == -1
            });
          }

          if (isFbMessagingSupported) {
            listenFCM(() => {
              playNotificationSound();
              notificationUnreadCountQuery.refetch();
            });
          }
        }
      }
      setFbSupport(isFbMessagingSupported ? "granted" : "denied");
    },
    [
      notificationUnreadCountQuery,
      notificationsSettingsQuery,
      setFbSupport,
      updateNotificationsSettings
    ]
  );

  useEffect(() => {
    if (activeUser && activeUser?.username !== previousActiveUsr?.username) {
      init(activeUser.username);
    }
  }, [activeUser, previousActiveUsr, init]);

  return children;
}
