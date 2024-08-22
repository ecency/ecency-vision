"use client";

import React, { Fragment, useMemo } from "react";
import "./_index.scss";
import { Button } from "@ui/button";
import { getAccountNotificationsQuery } from "@/api/queries";
import { EntryLink, LinearProgress, ProfileLink, UserAvatar } from "@/features/shared";
import i18next from "i18next";
import { Community } from "@/entities";
import { AccountNotification } from "@/api/bridge";
import { dateToFullRelative } from "@/utils";

interface ListItemProps {
  notification: AccountNotification;
}

export function NListItem({ notification }: ListItemProps) {
  const mentions = useMemo(() => notification.msg.match(/@[\w.\d-]+/gi), [notification]);
  const username = useMemo(() => mentions?.[0].replace("@", ""), [mentions]);
  const patterns = useMemo(() => {
    let formatPatterns = [];

    // @username/permlink
    if (notification.url.startsWith("@")) {
      formatPatterns.push(notification.url);
    }

    // @usernames
    return [...formatPatterns, ...(mentions ?? [])];
  }, [notification, mentions]);
  const parts = useMemo(
    () => notification.msg.split(new RegExp(`(${patterns.join("|")})`, "gi")),
    [notification, patterns]
  );

  return mentions ? (
    <div className="activity-list-item">
      <div className="activity-user">
        <ProfileLink username={username ?? ""}>
          <UserAvatar username={username ?? ""} size="medium" />
        </ProfileLink>
      </div>
      <div className="activity-content">
        <div className="activity-msg">
          {parts
            .filter((part) => part.trim() !== "")
            .map((part, i) => {
              if (patterns.includes(part.toLowerCase())) {
                // post link
                if (part.includes("/")) {
                  const s = part.split("/");
                  return (
                    <Fragment key={i}>
                      <EntryLink
                        entry={{
                          category: "post",
                          author: s[0].replace("@", ""),
                          permlink: s[1]
                        }}
                      >
                        {part}
                      </EntryLink>
                    </Fragment>
                  );
                }

                // user link
                return (
                  <Fragment key={i}>
                    <ProfileLink username={part.replace("@", "")}>
                      <>{part ?? ""}</>
                    </ProfileLink>
                  </Fragment>
                );
              }

              return <span key={i}>{part}</span>;
            })}
        </div>
        <div className="activity-date">{dateToFullRelative(notification.date)}</div>
      </div>
    </div>
  ) : (
    <></>
  );
}

interface Props {
  community: Community;
}

export function CommunityActivities({ community }: Props) {
  const { fetchNextPage, isLoading, data } = getAccountNotificationsQuery(
    community,
    50
  ).useClientQuery();

  const hasMore = useMemo(
    () => data?.pages && data.pages[data.pages?.length - 1]?.length === 50,
    [data?.pages]
  );
  const items = useMemo(
    () => data?.pages?.reduce((acc, page) => [...acc, ...page], []),
    [data?.pages]
  );

  return (
    <div className="community-activities">
      {isLoading && <LinearProgress />}
      <div className="activity-list">
        <div className="activity-list-body">
          {items?.map((item, i) => <NListItem key={i} notification={item} />)}
        </div>
      </div>
      {hasMore && (
        <div className="load-more">
          <Button disabled={isLoading || !hasMore} onClick={() => fetchNextPage()}>
            {i18next.t("g.load-more")}
          </Button>
        </div>
      )}
    </div>
  );
}
