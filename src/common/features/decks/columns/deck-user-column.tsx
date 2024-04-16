import React, { useContext, useEffect, useState } from "react";
import { ListItemSkeleton, SearchListItem } from "./deck-items";
import { GenericDeckWithDataColumn } from "./generic-deck-with-data-column";
import { UserDeckGridItem } from "../types";
import { getAccountPosts } from "../../../api/bridge";
import { Entry } from "../../../store/entries/types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { USER_CONTENT_TYPES, userTitles } from "../consts";
import { DeckGridContext } from "../deck-manager";
import { DeckPostViewer } from "./content-viewer";
import { History } from "history";
import { DeckContentTypeColumnSettings } from "./deck-column-settings/deck-content-type-column-settings";
import usePrevious from "react-use/lib/usePrevious";
import { _t } from "../../../i18n";
import moment from "moment";
import { newDataComingPaginatedCondition } from "../utils";
import { InfiniteScrollLoader } from "./helpers";

interface Props {
  id: string;
  settings: UserDeckGridItem["settings"];
  history: History;
  draggable?: DraggableProvidedDragHandleProps;
}

type IdentifiableEntry = Entry & Required<Pick<Entry, "id">>;

export const DeckUserColumn = ({ id, settings, draggable, history }: Props) => {
  const [data, setData] = useState<IdentifiableEntry[]>([]);
  const prevData = usePrevious(data);
  const [isReloading, setIsReloading] = useState(false);
  const [currentViewingEntry, setCurrentViewingEntry] = useState<Entry | null>(null);
  const [isFirstLoaded, setIsFirstLoaded] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  const { updateColumnIntervalMs } = useContext(DeckGridContext);
  const prevSettings = usePrevious(settings);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (prevSettings && prevSettings?.contentType !== settings.contentType) {
      setData([]);
      fetchData();
    }
  }, [settings.contentType]);

  const fetchData = async (since?: Entry) => {
    if (data.length) {
      setIsReloading(true);
    }

    try {
      const response = await getAccountPosts(
        settings.contentType,
        settings.username,
        since?.author,
        since?.permlink
      );
      let items = response?.map((i) => ({ ...i, id: i.post_id })) ?? [];
      items = items.sort((a, b) => (moment(a.created).isAfter(moment(b.created)) ? -1 : 1));

      if (items.length === 0) {
        setHasNextPage(false);
      }

      if (since) {
        setData([...data, ...items]);
      } else {
        setData(items ?? []);
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
        subtitle: userTitles[settings.contentType] ?? _t("decks.user"),
        icon: null,
        updateIntervalMs: settings.updateIntervalMs,
        setUpdateIntervalMs: (v) => updateColumnIntervalMs(id, v),
        additionalSettings: (
          <DeckContentTypeColumnSettings
            contentTypes={USER_CONTENT_TYPES}
            settings={settings}
            id={id}
          />
        )
      }}
      data={data}
      isVirtualScroll={false}
      isExpanded={!!currentViewingEntry}
      isReloading={isReloading}
      isFirstLoaded={isFirstLoaded}
      onReload={() => fetchData()}
      skeletonItem={<ListItemSkeleton />}
      newDataComingCondition={(newData) => newDataComingPaginatedCondition(newData, prevData)}
      contentViewer={
        currentViewingEntry ? (
          <DeckPostViewer
            entry={currentViewingEntry}
            history={history}
            onClose={() => setCurrentViewingEntry(null)}
            backTitle={`@${settings.username}(${userTitles[settings.contentType]})`}
          />
        ) : (
          <></>
        )
      }
      afterDataSlot={<InfiniteScrollLoader data={data} isEndReached={!hasNextPage} />}
    >
      {(item: any, measure: Function, index: number) => (
        <SearchListItem
          onMounted={() => measure()}
          index={index + 1}
          entry={{
            ...item,
            toggleNotNeeded: true
          }}
          {...item}
          children=""
          onAppear={() => {
            const isLast = data[data.length - 1]?.post_id === item.post_id;
            if (isLast && hasNextPage) {
              fetchData(item);
            }
          }}
          onEntryView={() => setCurrentViewingEntry(item)}
        />
      )}
    </GenericDeckWithDataColumn>
  );
};
