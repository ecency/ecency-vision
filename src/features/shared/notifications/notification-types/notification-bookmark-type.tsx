import React, { ReactElement } from "react";
import i18next from "i18next";
import { ApiBookmarkNotification } from "@/entities";
import { EntryLink } from "@/features/shared";

interface Props {
  sourceLink: ReactElement;
  onLinkClick?: () => void;
  afterClick: () => void;
  notification: ApiBookmarkNotification;
  openLinksInNewTab: boolean;
}

export function NotificationBookmarkType({
  sourceLink,
  onLinkClick,
  notification,
  afterClick,
  openLinksInNewTab
}: Props) {
  return (
    <div className="item-content">
      <div className="first-line">
        {sourceLink}
        <span className="item-action">{i18next.t("notifications.bookmark-str")}</span>
      </div>
      <div className="second-line">
        {!!onLinkClick ? (
          <a className="post-link" onClick={onLinkClick}>
            {notification.permlink}
          </a>
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
