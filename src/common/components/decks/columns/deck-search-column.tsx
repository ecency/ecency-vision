import React, { useContext, useEffect, useState } from "react";
import { ListItemSkeleton, SearchListItem } from "./deck-items";
import { GenericDeckColumn } from "./generic-deck-column";
import { SearchDeckGridItem } from "../types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { search, SearchResult } from "../../../api/search-api";
import { DeckGridContext } from "../deck-manager";
import { DeckPostViewer } from "./content-viewer";
import { Entry } from "../../../store/entries/types";
import { History } from "history";

interface Props {
  id: string;
  settings: SearchDeckGridItem["settings"];
  history: History;
  draggable?: DraggableProvidedDragHandleProps;
}

export const DeckSearchColumn = ({ id, settings, draggable, history }: Props) => {
  const [data, setData] = useState<SearchResult[]>([]);
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
      const response = await search(settings.query, "popularity", "1");
      setData(response.results ?? []);
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
        title: settings.query,
        subtitle: "Search query",
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
            backTitle={`Query: ${settings.query}`}
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
    </GenericDeckColumn>
  );
};
