import React, { useContext, useEffect, useState } from "react";
import { ShortListItemSkeleton } from "./deck-items";
import { GenericDeckWithDataColumn } from "./generic-deck-with-data-column";
import { UserDeckGridItem } from "../types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import NotificationListItem from "../../notifications/notification-list-item";
import { ApiNotification, NotificationFilter } from "../../../store/notifications/types";
import { useMappedStore } from "../../../store/use-mapped-store";
import { History } from "history";
import { getNotifications } from "../../../api/private-api";
import { NOTIFICATION_CONTENT_TYPES, notificationsTitles } from "../consts";
import { DeckGridContext } from "../deck-manager";
import { getPost } from "../../../api/bridge";
import { Entry } from "../../../store/entries/types";
import { DeckPostViewer } from "./content-viewer";
import { DeckLoginOverlayPlaceholder } from "./deck-login-overlay-placeholder";
import usePrevious from "react-use/lib/usePrevious";
import { DeckContentTypeColumnSettings } from "./deck-column-settings/deck-content-type-column-settings";
import { _t } from "../../../i18n";
import { InfiniteScrollLoader } from "./helpers";
import { newDataComingPaginatedCondition } from "../utils";

interface Props {
  id: string;
  settings: UserDeckGridItem["settings"];
  history: History;
  draggable?: DraggableProvidedDragHandleProps;
}

export const DeckNotificationsColumn = ({ id, settings, draggable, history }: Props) => {
  const { addAccount, dynamicProps, global, markNotifications, toggleUIProp, activeUser } =
    useMappedStore();
  const previousActiveUser = usePrevious(activeUser);

  const [data, setData] = useState<ApiNotification[]>([]);
  const prevData = usePrevious(data);
  const [isReloading, setIsReloading] = useState(false);
  const [currentViewingEntry, setCurrentViewingEntry] = useState<Entry>();
  const [isFirstLoaded, setIsFirstLoaded] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  const { updateColumnIntervalMs } = useContext(DeckGridContext);
  const prevSettings = usePrevious(settings);

  useEffect(() => {
    if (prevSettings && prevSettings?.contentType !== settings.contentType) {
      setData([]);
      fetchData();
    }
  }, [settings.contentType]);

  useEffect(() => {
    if (activeUser?.username !== previousActiveUser?.username) {
      fetchData();
    }

    if (!activeUser) {
      setData([]);
    }
  }, [activeUser]);

  const fetchData = async (since?: ApiNotification) => {
    if (data.length) {
      setIsReloading(true);
    }
    const isAll = settings.contentType === "all";

    try {
      const response = await getNotifications(
        activeUser!.username,
        isAll ? null : (settings.contentType as NotificationFilter),
        since?.id,
        settings.username
      );

      if (response.length === 0) {
        setHasNextPage(false);
      }

      if (since) {
        setData([...data, ...response]);
      } else {
        setData(response ?? []);
      }
    } catch (e) {
    } finally {
      setIsReloading(false);
      setIsFirstLoaded(true);
    }
  };

  return (
    <GenericDeckWithDataColumn
      id={id}
      draggable={draggable}
      header={{
        title: "@" + settings.username.toLowerCase(),
        subtitle: notificationsTitles[settings.contentType]
          ? `${_t("decks.notifications")} – ${notificationsTitles[settings.contentType]}`
          : _t("decks.notifications"),
        icon: null,
        updateIntervalMs: settings.updateIntervalMs,
        setUpdateIntervalMs: (v) => updateColumnIntervalMs(id, v),
        additionalSettings: (
          <DeckContentTypeColumnSettings
            contentTypes={NOTIFICATION_CONTENT_TYPES}
            settings={settings}
            id={id}
          />
        )
      }}
      data={data}
      isReloading={isReloading}
      onReload={() => fetchData()}
      skeletonItem={<ShortListItemSkeleton />}
      isExpanded={!!currentViewingEntry}
      isFirstLoaded={isFirstLoaded}
      contentViewer={
        currentViewingEntry && (
          <DeckPostViewer
            entry={currentViewingEntry}
            history={history}
            onClose={() => setCurrentViewingEntry(undefined)}
          />
        )
      }
      newDataComingCondition={(newData) =>
        newDataComingPaginatedCondition(newData, prevData, "timestamp")
      }
      overlay={<DeckLoginOverlayPlaceholder />}
      afterDataSlot={<InfiniteScrollLoader data={data} isEndReached={!hasNextPage} />}
    >
      {(item: ApiNotification, measure: Function, index: number) => (
        <NotificationListItem
          onMounted={() => {
            measure();

            const isLast = data[data.length - 1]?.id === item.id;
            if (isLast && hasNextPage) {
              fetchData(item);
            }
          }}
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
    </GenericDeckWithDataColumn>
  );
};
