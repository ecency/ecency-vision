import React, { useEffect, useState } from "react";
import { ListItemSkeleton, SearchListItem } from "./deck-items";
import { GenericDeckColumn } from "./generic-deck-column";
import { SearchDeckGridItem } from "../types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { search, SearchResult } from "../../../api/search-api";

interface Props {
  settings: SearchDeckGridItem["settings"];
  draggable?: DraggableProvidedDragHandleProps;
}

export const DeckSearchColumn = ({ settings, draggable }: Props) => {
  const [data, setData] = useState<SearchResult[]>([]);
  const [isReloading, setIsReloading] = useState(false);

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
      draggable={draggable}
      header={{
        title: settings.query,
        subtitle: "Search query",
        icon: null,
        updateIntervalMs: settings.updateIntervalMs
      }}
      data={data}
      isReloading={isReloading}
      onReload={() => fetchData()}
      onRemove={() => {}}
      skeletonItem={<ListItemSkeleton />}
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
        />
      )}
    </GenericDeckColumn>
  );
};
