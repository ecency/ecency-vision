import { Button } from "@ui/button";
import React from "react";
import { NotificationViewType } from "@/enums";
import { Tooltip } from "@ui/tooltip";
import i18next from "i18next";
import { checkSvg, playListAddCheck } from "@ui/svg";
import { useMarkNotifications } from "@/api/mutations";

interface Props {
  currentStatus: NotificationViewType;
  onStatusClick: (v: string) => void;
  isSelectIcon: boolean;
  select: boolean;
  onSelectClick?: () => void;
}

export function NotificationsStatusButtons({
  currentStatus,
  onStatusClick,
  onSelectClick,
  isSelectIcon,
  select
}: Props) {
  const markNotifications = useMarkNotifications();

  return (
    <div className="status-button-container">
      <div className="flex gap-2 px-3">
        {Object.values(NotificationViewType).map((status: string, k: number) => {
          return (
            <Button
              size="sm"
              outline={currentStatus !== status}
              key={k}
              tabIndex={-1}
              onClick={() => onStatusClick(status)}
            >
              {status}
            </Button>
          );
        })}
      </div>

      <div className="select-buttons">
        {isSelectIcon && (
          <Tooltip content={i18next.t("notifications.mark-selected-read")}>
            <span
              className="mark-svg"
              onClick={() => markNotifications.mutateAsync({ id: undefined })}
            >
              {playListAddCheck}
            </span>
          </Tooltip>
        )}

        <Tooltip
          content={select ? i18next.t("notifications.unselect") : i18next.t("notifications.select")}
        >
          <span
            className={`select-svg ${select ? "active" : ""} shadow-none`}
            onClick={onSelectClick}
          >
            {checkSvg}
          </span>
        </Tooltip>
      </div>
    </div>
  );
}
