"use client";

import "./_navbar-notifications-button.scss";
import { Button } from "@ui/button";
import { Tooltip } from "@ui/tooltip";
import i18next from "i18next";
import { useGlobalStore } from "@/core/global-store";
import { useNotificationUnreadCountQuery } from "@/api/queries";
import { bellOffSvg, bellSvg } from "@ui/svg";

export function NavbarNotificationsButton({ onClick }: { onClick?: () => void }) {
  const usePrivate = useGlobalStore((state) => state.usePrivate);
  const toggleUiProp = useGlobalStore((state) => state.toggleUiProp);
  const globalNotifications = useGlobalStore((state) => state.globalNotifications);

  const { data: unread } = useNotificationUnreadCountQuery();

  return usePrivate ? (
    <>
      <Tooltip content={i18next.t("user-nav.notifications")}>
        <div
          className="notifications"
          onClick={() => {
            toggleUiProp("notifications");
            onClick?.();
          }}
        >
          {unread > 0 && (
            <span className="notifications-badge notranslate">
              {unread.toString().length < 3 ? unread : "..."}
            </span>
          )}
          <Button icon={globalNotifications ? bellSvg : bellOffSvg} appearance="gray-link" />
        </div>
      </Tooltip>
    </>
  ) : (
    <></>
  );
}
