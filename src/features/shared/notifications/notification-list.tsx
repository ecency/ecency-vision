import React, { Fragment, useMemo } from "react";
import { useNotificationsQuery } from "@/api/queries";
import { LinearProgress } from "@/features/shared";
import { NotificationFilter, NotificationViewType } from "@/enums";
import { NotificationListItem } from "@/features/shared/notifications/notification-list-item";
import i18next from "i18next";
import { date2key } from "@/features/shared/notifications/utils";

interface Props {
  filter: NotificationFilter | null;
  currentStatus: NotificationViewType;
  openLinksInNewTab?: boolean;
  select?: boolean;
  setSelectedNotifications: (d: string) => void;
}

export function NotificationList({
  filter,
  currentStatus,
  openLinksInNewTab,
  select,
  setSelectedNotifications
}: Props) {
  const { data, isLoading, fetchNextPage } = useNotificationsQuery(filter);

  const dataFlow = useMemo(() => data?.pages.reduce((acc, page) => [...acc, ...page], []), [data]);

  return (
    <>
      {isLoading ? <LinearProgress /> : <></>}

      {!isLoading && dataFlow.length === 0 && (
        <div className="list-body empty-list">
          <span className="empty-text">{i18next.t("g.empty-list")}</span>
        </div>
      )}
      {dataFlow.length > 0 && (
        <div className="list-body">
          {dataFlow.map((n, i) => (
            <Fragment key={n.id}>
              {currentStatus === NotificationViewType.ALL && (
                <>
                  {n.gkf && <div className="group-title">{date2key(n.gk)}</div>}
                  <NotificationListItem
                    notification={n}
                    isSelect={select}
                    setSelectedNotifications={setSelectedNotifications}
                    openLinksInNewTab={openLinksInNewTab}
                    onInViewport={(inViewport) => {
                      if (inViewport && i === dataFlow.length - 1) {
                        fetchNextPage();
                      }
                    }}
                  />
                </>
              )}
              {currentStatus === NotificationViewType.READ && n.read === 1 && (
                <>
                  {n.gkf && <div className="group-title">{date2key(n.gk)}</div>}
                  <NotificationListItem
                    notification={n}
                    isSelect={select}
                    setSelectedNotifications={setSelectedNotifications}
                    openLinksInNewTab={openLinksInNewTab}
                    onInViewport={(inViewport) => {
                      if (inViewport && i === dataFlow.length - 1) {
                        fetchNextPage();
                      }
                    }}
                  />
                </>
              )}
              {currentStatus === NotificationViewType.UNREAD && n.read === 0 && (
                <>
                  {n.gkf && <div className="group-title">{date2key(n.gk)}</div>}
                  <NotificationListItem
                    notification={n}
                    isSelect={select}
                    setSelectedNotifications={setSelectedNotifications}
                    openLinksInNewTab={openLinksInNewTab}
                    onInViewport={(inViewport) => {
                      if (inViewport && i === dataFlow.length - 1) {
                        fetchNextPage();
                      }
                    }}
                  />
                </>
              )}
            </Fragment>
          ))}
        </div>
      )}
      {isLoading && dataFlow.length > 0 && <LinearProgress />}
    </>
  );
}
