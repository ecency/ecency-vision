import React, { ReactElement } from "react";
import { ApiVoteNotification } from "@/entities";
import { EntryLink } from "@/features/shared";
import i18next from "i18next";

interface Props {
  sourceLink: ReactElement;
  notification: ApiVoteNotification;
  onLinkClick?: () => void;
  afterClick: () => void;
  openLinksInNewTab: boolean;
}

export function NotificationVoteType({
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
        <span className="item-action">
          {i18next.t("notifications.vote-str", { p: notification.weight / 100 })}
        </span>
      </div>
      <div className="second-line">
        {!!onLinkClick ? (
          <div className="markdown-view mini-markdown reply-body" onClick={onLinkClick}>
            {notification.permlink}
          </div>
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
