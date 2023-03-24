import React, { useEffect, useState } from "react";
import { ListItemSkeleton } from "./deck-items";
import { GenericDeckColumn } from "./generic-deck-column";
import { UserDeckGridItem } from "../types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import NotificationListItem from "../../notifications/notification-list-item";
import { ApiNotification, NotificationFilter } from "../../../store/notifications/types";
import { useMappedStore } from "../../../store/use-mapped-store";
import { History } from "history";
import { getNotifications } from "../../../api/private-api";

interface Props {
  settings: UserDeckGridItem["settings"];
  history: History;
  draggable?: DraggableProvidedDragHandleProps;
}

export const DeckNotificationsColumn = ({ settings, draggable, history }: Props) => {
  const { addAccount, dynamicProps, global, markNotifications, toggleUIProp, activeUser } =
    useMappedStore();

  const [data, setData] = useState<ApiNotification[]>([]);
  const [isReloading, setIsReloading] = useState(false);

  const titles = {
    all: "",
    rvotes: "Votes",
    mentions: "Mentions",
    nfavorites: "Favourites",
    nbookmarks: "Bookmarks",
    follows: "Follows",
    replies: "Replies",
    reblogs: "Reblogs",
    transfers: "Transfers",
    delegations: "Delegations"
  };

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
      draggable={draggable}
      header={{
        title: "@" + settings.username.toLowerCase(),
        subtitle: titles[settings.contentType]
          ? `Notifications – ${titles[settings.contentType]}`
          : "Notifications",
        icon: null,
        updateIntervalMs: settings.updateIntervalMs
      }}
      data={data}
      isReloading={isReloading}
      onReload={() => fetchData()}
      onRemove={() => {}}
      skeletonItem={<ListItemSkeleton />}
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
        />
      )}
    </GenericDeckColumn>
  );
};
