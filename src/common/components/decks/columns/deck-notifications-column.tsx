import React, { useContext, useEffect, useState } from "react";
import { ShortListItemSkeleton } from "./deck-items";
import { GenericDeckColumn } from "./generic-deck-column";
import { UserDeckGridItem } from "../types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import NotificationListItem from "../../notifications/notification-list-item";
import { ApiNotification, NotificationFilter } from "../../../store/notifications/types";
import { useMappedStore } from "../../../store/use-mapped-store";
import { History } from "history";
import { getNotifications } from "../../../api/private-api";
import { notificationsTitles } from "../consts";
import { DeckGridContext } from "../deck-manager";
import { getPost } from "../../../api/bridge";
import { Entry } from "../../../store/entries/types";
import { DeckPostViewer } from "./content-viewer";

interface Props {
  id: string;
  settings: UserDeckGridItem["settings"];
  history: History;
  draggable?: DraggableProvidedDragHandleProps;
}

export const DeckNotificationsColumn = ({ id, settings, draggable, history }: Props) => {
  const { addAccount, dynamicProps, global, markNotifications, toggleUIProp, activeUser } =
    useMappedStore();

  const [data, setData] = useState<ApiNotification[]>([]);
  const [isReloading, setIsReloading] = useState(false);
  const [currentViewingEntry, setCurrentViewingEntry] = useState<Entry>();

  const { updateColumnIntervalMs } = useContext(DeckGridContext);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (data.length) {
      setIsReloading(true);
    }
    const isAll = settings.contentType === "all";

    try {
      const response = await getNotifications(
        activeUser!.username,
        isAll ? null : (settings.contentType as NotificationFilter),
        null,
        settings.username
      );
      setData(response ?? []);
    } catch (e) {
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <GenericDeckColumn
      id={id}
      draggable={draggable}
      header={{
        title: "@" + settings.username.toLowerCase(),
        subtitle: notificationsTitles[settings.contentType]
          ? `Notifications – ${notificationsTitles[settings.contentType]}`
          : "Notifications",
        icon: null,
        updateIntervalMs: settings.updateIntervalMs,
        setUpdateIntervalMs: (v) => updateColumnIntervalMs(id, v)
      }}
      data={data}
      isReloading={isReloading}
      onReload={() => fetchData()}
      skeletonItem={<ShortListItemSkeleton />}
      isExpanded={!!currentViewingEntry}
      contentViewer={
        currentViewingEntry && (
          <DeckPostViewer
            entry={currentViewingEntry}
            history={history}
            onClose={() => setCurrentViewingEntry(undefined)}
          />
        )
      }
    >
      {(item: ApiNotification, measure: Function, index: number) => (
        <NotificationListItem
          onMounted={() => measure()}
          notification={item}
          addAccount={addAccount}
          dynamicProps={dynamicProps}
          global={global}
          history={history}
          markNotifications={markNotifications}
          toggleUIProp={toggleUIProp}
          className="notification-list-item"
          onLinkClick={async () => {
            switch (item.type) {
              case "bookmarks":
              case "mention":
              case "reply":
              case "unvote":
              case "vote":
              case "favorites":
              case "reblog":
                const entry = await getPost(item.author, item.permlink);
                if (entry) {
                  setCurrentViewingEntry(entry);
                }
                break;
              case "delegations":
              case "follow":
              case "ignore":
              case "inactive":
              case "referral":
              case "transfer":
              case "unfollow":
              case "spin":
              default:
                break;
            }
          }}
        />
      )}
    </GenericDeckColumn>
  );
};
