import React, { ReactElement } from "react";
import { ApiReblogNotification } from "@/entities";
import i18next from "i18next";
import { EntryLink } from "@/features/shared";

interface Props {
  sourceLink: ReactElement;
  notification: ApiReblogNotification;
  onLinkClick?: () => void;
  afterClick: () => void;
  openLinksInNewTab: boolean;
}

export function NotificationReblogType({
  sourceLink,
  notification,
  onLinkClick,
  afterClick,
  openLinksInNewTab
}: Props) {
  return (
    <div className="item-content">
      <div className="first-line">
        {sourceLink}
        <span className="item-action">{i18next.t("notifications.reblog-str")}</span>
      </div>
      <div className="second-line">
        {!!onLinkClick ? (
          <a className="post-link">{notification.permlink}</a>
        ) : (
          <EntryLink
            entry={{
              category: "category",
              author: notification.author,
              permlink: notification.permlink
            }}
            afterClick={afterClick}
            target={openLinksInNewTab ? "_blank" : undefined}
          >
            <div className="post-link">{notification.permlink}</div>
          </EntryLink>
        )}
      </div>
    </div>
  );
}
