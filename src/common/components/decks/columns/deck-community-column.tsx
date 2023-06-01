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

interface Props {
  id: string;
  settings: CommunityDeckGridItem["settings"];
  history: History;
  draggable?: DraggableProvidedDragHandleProps;
}

type IdentifiableEntry = Entry & Required<Pick<Entry, "id">>;

export const DeckCommunityColumn = ({ id, settings, draggable, history }: Props) => {
  const [data, setData] = useState<IdentifiableEntry[]>([]);
  const [isReloading, setIsReloading] = useState(false);
  const [currentViewingEntry, setCurrentViewingEntry] = useState<Entry | null>(null);
  const [isFirstLoaded, setIsFirstLoaded] = useState(false);

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

  const fetchData = async () => {
    if (data.length) {
      setIsReloading(true);
    }

    if (isReloading) {
      return;
    }

    try {
      const response = await getPostsRanked(settings.contentType, "", "", 20, settings.tag);
      setData(
        ((response as IdentifiableEntry[] | null) ?? []).filter((e) =>
          settings.contentType === "created" ? !e.stats?.is_pinned : true
        )
      );
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
        subtitle: communityTitles[settings.contentType] ?? "User",
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
      isReloading={isReloading}
      isExpanded={!!currentViewingEntry}
      isFirstLoaded={isFirstLoaded}
      onReload={() => fetchData()}
      skeletonItem={<ListItemSkeleton />}
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
          onEntryView={() => setCurrentViewingEntry(item)}
        />
      )}
    </GenericDeckWithDataColumn>
  );
};
