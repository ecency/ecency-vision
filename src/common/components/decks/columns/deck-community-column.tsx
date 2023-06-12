import React, { useContext, useEffect, useState } from "react";
import { ListItemSkeleton, SearchListItem } from "./deck-items";
import { GenericDeckWithDataColumn } from "./generic-deck-with-data-column";
import { CommunityDeckGridItem } from "../types";
import { getPostsRanked } from "../../../api/bridge";
import { Entry } from "../../../store/entries/types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { COMMUNITY_CONTENT_TYPES, communityTitles } from "../consts";
import { DeckGridContext } from "../deck-manager";
import { DeckPostViewer } from "./content-viewer";
import { History } from "history";
import { DeckContentTypeColumnSettings } from "./deck-column-settings/deck-content-type-column-settings";
import usePrevious from "react-use/lib/usePrevious";
import { _t } from "../../../i18n";
import { newDataComingPaginatedCondition } from "../utils";
import { InfiniteScrollLoader } from "./helpers";

interface Props {
  id: string;
  settings: CommunityDeckGridItem["settings"];
  history: History;
  draggable?: DraggableProvidedDragHandleProps;
}

type IdentifiableEntry = Entry & Required<Pick<Entry, "id">>;

export const DeckCommunityColumn = ({ id, settings, draggable, history }: Props) => {
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

    if (isReloading) {
      return;
    }

    try {
      const response = await getPostsRanked(
        settings.contentType,
        since?.author,
        since?.permlink,
        20,
        settings.tag
      );
      const items = ((response as IdentifiableEntry[] | null) ?? [])
        .filter((e) => !e.stats?.is_pinned)
        .map((i) => ({ ...i, id: i.post_id }));

      if (items.length === 0) {
        setHasNextPage(false);
      }

      if (since) {
        setData([...data, ...items]);
      } else {
        setData(items);
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
        title: settings.username.toLowerCase(),
        subtitle: communityTitles[settings.contentType] ?? _t("decks.user"),
        icon: null,
        updateIntervalMs: settings.updateIntervalMs,
        setUpdateIntervalMs: (v) => updateColumnIntervalMs(id, v),
        additionalSettings: (
          <DeckContentTypeColumnSettings
            contentTypes={COMMUNITY_CONTENT_TYPES}
            settings={settings}
            id={id}
          />
        )
      }}
      data={data}
      isVirtualScroll={false}
      isReloading={isReloading}
      isExpanded={!!currentViewingEntry}
      isFirstLoaded={isFirstLoaded}
      onReload={() => fetchData()}
      skeletonItem={<ListItemSkeleton />}
      newDataComingCondition={(nextData) => newDataComingPaginatedCondition(nextData, prevData)}
      afterDataSlot={<InfiniteScrollLoader data={data} isEndReached={!hasNextPage} />}
      contentViewer={
        currentViewingEntry ? (
          <DeckPostViewer
            entry={currentViewingEntry}
            onClose={() => setCurrentViewingEntry(null)}
            history={history}
            backTitle={`${settings.username}(${communityTitles[settings.contentType]})`}
          />
        ) : undefined
      }
    >
      {(item: any, measure: Function, index: number) => (
        <SearchListItem
          index={index + 1}
          entry={{
            ...item,
            toggleNotNeeded: true
          }}
          {...item}
          children=""
          onMounted={() => measure()}
          onAppear={() => {
            const isLast = data[data.length - 1]?.id === item.id;
            if (isLast && hasNextPage) {
              fetchData(item);
            }
          }}
          EntryView={() => setCurrentViewingEntry(item)}
        />
      )}
    </GenericDeckWithDataColumn>
  );
};
