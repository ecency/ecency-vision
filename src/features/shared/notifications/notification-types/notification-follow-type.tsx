import React, { ReactElement } from "react";
import { ApiFollowNotification } from "@/entities";
import i18next from "i18next";

interface Props {
  sourceLink: ReactElement;
  notification: ApiFollowNotification;
}

export function NotificationFollowType({ notification, sourceLink }: Props) {
  return (
    <div className="item-content">
      <div className="first-line">{sourceLink}</div>
      <div className="second-line">
        {notification.type === "follow" && (
          <span className="follow-label">{i18next.t("notifications.followed-str")}</span>
        )}
        {notification.type === "unfollow" && (
          <span className="unfollow-label">{i18next.t("notifications.unfollowed-str")}</span>
        )}
        {notification.type === "ignore" && (
          <span className="ignore-label">{i18next.t("notifications.ignored-str")}</span>
        )}
      </div>
    </div>
  );
}
