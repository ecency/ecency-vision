import { postBodySummary } from "@ecency/render-helper";
import React, { ReactElement } from "react";
import { ApiReplyNotification } from "@/entities";
import i18next from "i18next";
import { EntryLink } from "@/features/shared";

interface Props {
  sourceLink: ReactElement;
  onLinkClick?: () => void;
  afterClick: () => void;
  notification: ApiReplyNotification;
  openLinksInNewTab: boolean;
}

export function NotificationReplyType({
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
        <span className="item-action">{i18next.t("notifications.reply-str")}</span>
        <div className="vert-separator" />
        {!!onLinkClick ? (
          <a className="post-link" onClick={onLinkClick}>
            {notification.parent_permlink}
          </a>
        ) : (
          <EntryLink
            entry={{
              category: "category",
              author: notification.parent_author,
              permlink: notification.parent_permlink
            }}
            afterClick={afterClick}
            target={openLinksInNewTab ? "_blank" : undefined}
          >
            <div className="post-link">{notification.parent_permlink}</div>
          </EntryLink>
        )}
      </div>
      <div className="second-line">
        {!!onLinkClick ? (
          <div className="markdown-view mini-markdown reply-body" onClick={onLinkClick}>
            {postBodySummary(notification.body, 100)}
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
            <div className="post-link">{postBodySummary(notification.body, 100)}</div>
          </EntryLink>
        )}
      </div>
    </div>
  );
}
