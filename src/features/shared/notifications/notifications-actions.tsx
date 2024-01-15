import { FormControl, Tooltip } from "@/features/ui";
import React, { useEffect } from "react";
import { useGlobalStore } from "@/core/global-store";
import i18next from "i18next";
import i18n from "i18next";
import { checkSvg, settingsSvg, syncSvg } from "@ui/svg";
import {
  Dropdown,
  DropdownItem,
  DropdownItemHeader,
  DropdownMenu,
  DropdownToggle
} from "@ui/dropdown";
import { NotificationFilter, NotifyTypes } from "@/enums";
import { classNameObject } from "@ui/util";
import {
  useNotificationsQuery,
  useNotificationsSettingsQuery,
  useNotificationUnreadCountQuery
} from "@/api/queries";
import { hiveNotifySetLastRead } from "@/api/operations";
import { useMarkNotifications, useUpdateNotificationsSettings } from "@/api/mutations";
import { useDebounce, useMap } from "react-use";

interface Props {
  filter: NotificationFilter | null;
}

export function NotificationsActions({ filter }: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const isMobile = useGlobalStore((state) => state.isMobile);

  const [settings, { set: setSettingItem }] = useMap<Record<NotifyTypes, boolean>>({
    [NotifyTypes.COMMENT]: false,
    [NotifyTypes.FOLLOW]: false,
    [NotifyTypes.MENTION]: false,
    [NotifyTypes.FAVORITES]: false,
    [NotifyTypes.BOOKMARKS]: false,
    [NotifyTypes.VOTE]: false,
    [NotifyTypes.RE_BLOG]: false,
    [NotifyTypes.TRANSFERS]: false,
    [NotifyTypes.ALLOW_NOTIFY]: false
  });

  const { data: notificationSettings } = useNotificationsSettingsQuery();
  const {
    data: unread,
    refetch: refetchUnread,
    isLoading: isUnreadLoading
  } = useNotificationUnreadCountQuery();
  const { refetch: refetchData, isLoading: isDataLoading } = useNotificationsQuery(filter);

  const markNotifications = useMarkNotifications();
  const updateSettings = useUpdateNotificationsSettings();

  useEffect(() => {
    if (notificationSettings) {
      Array.from(Object.keys(settings) as NotifyTypes[]).forEach((type) =>
        setSettingItem(type, false)
      );
      notificationSettings.notify_types?.map((type) => setSettingItem(type, true));
    }
  }, [notificationSettings]);

  useDebounce(
    () => {
      const enabledTypes = Array.from(Object.keys(settings) as NotifyTypes[]).filter(
        (type) => settings[type]
      );
      const isSame =
        enabledTypes.every((et) => notificationSettings?.notify_types?.every((nt) => et !== nt)) &&
        enabledTypes.length === notificationSettings?.notify_types?.length;
      if (!isSame) {
        updateSettings.mutateAsync({
          notifyTypes: enabledTypes,
          isEnabled: enabledTypes.length > 0
        });
      }
    },
    500,
    [settings]
  );

  const getNotificationSettingsItem = (title: string, type: NotifyTypes) => (
    <FormControl
      label={i18next.t(title)}
      type="checkbox"
      isToggle={true}
      checked={settings[type]}
      onChange={() => setSettingItem(type, !settings[type])}
    />
  );

  const markAsRead = () => {
    markNotifications.mutateAsync({ id: undefined });
    hiveNotifySetLastRead(activeUser!.username).then();
  };

  const refresh = () => {
    refetchUnread();
    refetchData();
  };

  return (
    <div className="list-actions">
      {!isMobile ? (
        <>
          <Tooltip content={i18next.t("notifications.mark-all-read")}>
            <span
              className={classNameObject({
                "list-action": true,
                disabled: markNotifications.isPending || unread === 0
              })}
              onClick={() => markAsRead()}
            >
              {checkSvg}
            </span>
          </Tooltip>
          <Tooltip content={i18next.t("notifications.refresh")}>
            <span
              className={classNameObject({
                "list-action": true,
                disabled: isDataLoading || isUnreadLoading
              })}
              onClick={() => refresh()}
            >
              {syncSvg}
            </span>
          </Tooltip>
        </>
      ) : (
        <></>
      )}

      <Dropdown>
        <DropdownToggle>
          <span
            className={classNameObject({
              "list-action": true,
              disabled: updateSettings.isPending
            })}
          >
            {settingsSvg}
          </span>
        </DropdownToggle>
        <DropdownMenu align="right">
          <DropdownItemHeader>{i18next.t(`notifications.settings`)}</DropdownItemHeader>
          {isMobile && (
            <DropdownItem onClick={() => markAsRead()}>
              <Tooltip content={i18n.t(`notifications.mark-all-read`)}>
                <div className="list-actions">
                  <Tooltip content={i18next.t("notifications.mark-all-read")}>
                    <span
                      className={classNameObject({
                        "list-action": true,
                        disabled: markNotifications.isPending || unread === 0
                      })}
                    >
                      {checkSvg}
                    </span>
                  </Tooltip>
                </div>
              </Tooltip>
            </DropdownItem>
          )}
          {isMobile && (
            <DropdownItem onClick={() => refresh()}>
              <Tooltip content={i18next.t(`notifications.refresh`)}>
                <div className="list-actions">
                  <Tooltip content={i18next.t("notifications.refresh")}>
                    <span
                      className={classNameObject({
                        "list-action": true,
                        disabled: isDataLoading || isUnreadLoading
                      })}
                    >
                      {syncSvg}
                    </span>
                  </Tooltip>
                </div>
              </Tooltip>
            </DropdownItem>
          )}
          <DropdownItem hideOnClick={false}>
            {getNotificationSettingsItem(i18next.t(`notifications.type-rvotes`), NotifyTypes.VOTE)}
          </DropdownItem>
          <DropdownItem hideOnClick={false}>
            {getNotificationSettingsItem(
              i18next.t(`notifications.type-replies`),
              NotifyTypes.COMMENT
            )}
          </DropdownItem>
          <DropdownItem hideOnClick={false}>
            {getNotificationSettingsItem(
              i18next.t(`notifications.type-mentions`),
              NotifyTypes.MENTION
            )}
          </DropdownItem>
          <DropdownItem hideOnClick={false}>
            {getNotificationSettingsItem(
              i18next.t(`notifications.type-nfavorites`),
              NotifyTypes.FAVORITES
            )}
          </DropdownItem>
          <DropdownItem hideOnClick={false}>
            {getNotificationSettingsItem(
              i18next.t(`notifications.type-nbookmarks`),
              NotifyTypes.BOOKMARKS
            )}
          </DropdownItem>
          <DropdownItem hideOnClick={false}>
            {getNotificationSettingsItem(
              i18next.t(`notifications.type-reblogs`),
              NotifyTypes.RE_BLOG
            )}
          </DropdownItem>
          <DropdownItem hideOnClick={false}>
            {getNotificationSettingsItem(
              i18next.t(`notifications.type-follows`),
              NotifyTypes.FOLLOW
            )}
          </DropdownItem>
          <DropdownItem hideOnClick={false}>
            {getNotificationSettingsItem(
              i18next.t(`notifications.type-transfers`),
              NotifyTypes.TRANSFERS
            )}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
