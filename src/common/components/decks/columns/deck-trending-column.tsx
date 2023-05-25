import React, { useContext, useEffect, useState } from "react";
import { ListItemSkeleton, SearchListItem } from "./deck-items";
import { GenericDeckWithDataColumn } from "./generic-deck-with-data-column";
import { ReloadableDeckGridItem } from "../types";
import { getPostsRanked } from "../../../api/bridge";
import { Entry } from "../../../store/entries/types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { DeckGridContext } from "../deck-manager";
import { DeckPostViewer } from "./content-viewer";
import { History } from "history";

interface Props {
  id: string;
  settings: ReloadableDeckGridItem["settings"];
  history: History;
  draggable?: DraggableProvidedDragHandleProps;
}

type IdentifiableEntry = Entry & Required<Pick<Entry, "id">>;

export const DeckTrendingColumn = ({ id, settings, draggable, history }: Props) => {
  const [data, setData] = useState<IdentifiableEntry[]>([]);
  const [isReloading, setIsReloading] = useState(false);
  const [currentViewingEntry, setCurrentViewingEntry] = useState<Entry | null>(null);

  const { updateColumnIntervalMs } = useContext(DeckGridContext);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (data.length) {
      setIsReloading(true);
    }

    try {
      const response = await getPostsRanked("trending");
      setData((response as IdentifiableEntry[]) ?? []);
    } catch (e) {
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <GenericDeckWithDataColumn
      id={id}
      draggable={draggable}
      header={{
        title: "Trending",
        subtitle: "Posts",
        icon: null,
        updateIntervalMs: settings.updateIntervalMs,
        setUpdateIntervalMs: (v) => updateColumnIntervalMs(id, v)
      }}
      data={data}
      isExpanded={!!currentViewingEntry}
      isReloading={isReloading}
      onReload={() => fetchData()}
      skeletonItem={<ListItemSkeleton />}
      contentViewer={
        currentViewingEntry ? (
          <DeckPostViewer
            entry={currentViewingEntry}
            history={history}
            onClose={() => setCurrentViewingEntry(null)}
            backTitle="Trending"
          />
        ) : (
          <></>
        )
      }
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
          onEntryView={() => setCurrentViewingEntry(item)}
        />
      )}
    </GenericDeckWithDataColumn>
  );
};
