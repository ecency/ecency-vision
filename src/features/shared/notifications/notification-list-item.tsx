import React, { useEffect, useMemo, useRef, useState } from "react";
import { ApiMentionNotification, ApiNotification } from "@/entities";
import { NotificationReferralType } from "@/features/shared/notifications/notification-types/notification-referral-type";
import { NotificationInactiveType } from "@/features/shared/notifications/notification-types/notification-inactive-type";
import { NotificationSpinType } from "@/features/shared/notifications/notification-types/notification-spin-type";
import { NotificationDelegationsType } from "@/features/shared/notifications/notification-types/notification-delegations-type";
import { NotificationTransferType } from "@/features/shared/notifications/notification-types/notification-transfer-type";
import { NotificationReblogType } from "@/features/shared/notifications/notification-types/notification-reblog-type";
import { NotificationFollowType } from "@/features/shared/notifications/notification-types/notification-follow-type";
import { NotificationBookmarkType } from "@/features/shared/notifications/notification-types/notification-bookmark-type";
import { NotificationFavouriteType } from "@/features/shared/notifications/notification-types/notification-favourite-type";
import { NotificationMentionType } from "@/features/shared/notifications/notification-types/notification-mention-type";
import { NotificationReplyType } from "@/features/shared/notifications/notification-types/notification-reply-type";
import { NotificationVoteType } from "@/features/shared/notifications/notification-types/notification-vote-type";
import i18next from "i18next";
import { Tooltip } from "@ui/tooltip";
import { classNameObject } from "@ui/util";
import { ProfileLink, UserAvatar } from "@/features/shared";
import { useGlobalStore } from "@/core/global-store";
import { useMarkNotifications } from "@/api/mutations";
import { useDebounce, usePrevious } from "react-use";
import useMount from "react-use/lib/useMount";
import { useInViewport } from "react-in-viewport";
import { FormControl } from "@ui/input";

interface State {
  isChecked: boolean;
}

interface Props {
  notification: ApiNotification;
  entry?: ApiNotification;
  isSelect?: boolean;
  setSelectedNotifications?: (d: string) => void;
  onMounted?: () => void;
  onAppear?: () => void;
  className?: string;
  onLinkClick?: () => void;
  openLinksInNewTab?: boolean;
  onInViewport?: (inViewport: boolean) => void;
}

export function NotificationListItem({
  notification: primaryNotification,
  entry,
  isSelect,
  className,
  openLinksInNewTab = false,
  onLinkClick,
  setSelectedNotifications,
  onMounted,
  onInViewport
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { inViewport } = useInViewport(ref);

  const toggleUIProp = useGlobalStore((state) => state.toggleUiProp);

  const [isChecked, setIsChecked] = useState(false);
  const previousIsSelect = usePrevious(isSelect);

  const notification = useMemo(() => primaryNotification || entry, [primaryNotification, entry]);

  const markNotifications = useMarkNotifications();

  useMount(() => {
    onMounted?.();
  });

  useDebounce(
    () => {
      onInViewport?.(inViewport);
    },
    500,
    [inViewport]
  );

  useEffect(() => {
    if (previousIsSelect !== isSelect && !isSelect) {
      setIsChecked(false);
    }
  }, [isSelect, previousIsSelect]);

  const markAsRead = () => {
    if (notification!.read === 0 && !(notification as ApiMentionNotification).deck) {
      markNotifications.mutateAsync({ id: notification!.id });
    }
  };

  const afterClick = () => {
    !(entry && (entry as any).toggleNotNeeded) && toggleUIProp("notifications");
    markAsRead();
  };

  const handleChecked = (id: string) => {
    if (isSelect) {
      setIsChecked(!isChecked);
      setSelectedNotifications?.(id);
    }
  };

  const sourceLinkMain = (
    <ProfileLink
      username={notification.source}
      afterClick={afterClick}
      target={openLinksInNewTab ? "_blank" : undefined}
    >
      <span className="source-avatar">
        <UserAvatar username={notification?.source} size="medium" />
      </span>
    </ProfileLink>
  );
  const sourceLink = (
    <ProfileLink
      username={notification.source}
      afterClick={afterClick}
      target={openLinksInNewTab ? "_blank" : undefined}
    >
      <span className="source-name"> {notification.source}</span>
    </ProfileLink>
  );

  return (
    <div
      ref={ref}
      title={notification.timestamp}
      className={classNameObject({
        "list-item": true,
        "not-read": notification.read === 0 && !(notification as ApiMentionNotification).deck,
        [className ?? ""]: !!className
      })}
      onClick={() => handleChecked(notification!.id)}
      key={notification.id}
    >
      <div
        className={`item-inner ${(notification as ApiMentionNotification).deck ? "p-2 m-0" : ""}`}
      >
        {isSelect ? (
          <div className="checkbox">
            <FormControl type="checkbox" checked={isChecked} onChange={() => {}} />
          </div>
        ) : (
          <div
            className={`item-control ${
              (notification as ApiMentionNotification).deck ? "item-control-deck" : ""
            }`}
          >
            {!(notification as ApiMentionNotification).deck && notification.read === 0 && (
              <Tooltip content={i18next.t("notifications.mark-read")}>
                <span onClick={markAsRead} className="mark-read" />
              </Tooltip>
            )}
          </div>
        )}

        <div className="source">{sourceLinkMain}</div>

        {(notification.type === "vote" || notification.type === "unvote") && (
          <NotificationVoteType
            onLinkClick={onLinkClick}
            sourceLink={sourceLink}
            afterClick={afterClick}
            notification={notification}
            openLinksInNewTab={openLinksInNewTab}
          />
        )}
        {notification.type === "reply" && (
          <NotificationReplyType
            onLinkClick={onLinkClick}
            sourceLink={sourceLink}
            afterClick={afterClick}
            notification={notification}
            openLinksInNewTab={openLinksInNewTab}
          />
        )}
        {notification.type === "mention" && (
          <NotificationMentionType
            onLinkClick={onLinkClick}
            sourceLink={sourceLink}
            afterClick={afterClick}
            notification={notification}
            openLinksInNewTab={openLinksInNewTab}
          />
        )}
        {notification.type === "favorites" && (
          <NotificationFavouriteType
            onLinkClick={onLinkClick}
            sourceLink={sourceLink}
            afterClick={afterClick}
            notification={notification}
            openLinksInNewTab={openLinksInNewTab}
          />
        )}
        {notification.type === "bookmarks" && (
          <NotificationBookmarkType
            onLinkClick={onLinkClick}
            sourceLink={sourceLink}
            afterClick={afterClick}
            notification={notification}
            openLinksInNewTab={openLinksInNewTab}
          />
        )}
        {(notification.type === "follow" ||
          notification.type === "unfollow" ||
          notification.type === "ignore") && (
          <NotificationFollowType sourceLink={sourceLink} notification={notification} />
        )}
        {notification.type === "reblog" && (
          <NotificationReblogType
            onLinkClick={onLinkClick}
            sourceLink={sourceLink}
            notification={notification}
            afterClick={afterClick}
            openLinksInNewTab={openLinksInNewTab}
          />
        )}
        {notification.type === "transfer" && (
          <NotificationTransferType sourceLink={sourceLink} notification={notification} />
        )}
        {notification.type === "delegations" && (
          <NotificationDelegationsType sourceLink={sourceLink} notification={notification} />
        )}
        {notification.type === "spin" && <NotificationSpinType sourceLink={sourceLink} />}
        {notification.type === "inactive" && <NotificationInactiveType sourceLink={sourceLink} />}
        {notification.type === "referral" && <NotificationReferralType sourceLink={sourceLink} />}
      </div>
    </div>
  );
}
