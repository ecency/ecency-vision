import React, { useEffect, useState } from "react";
import { HotListItem, ShortListItemSkeleton } from "./deck-items";
import { GenericDeckColumn } from "./generic-deck-column";
import { ReloadableDeckGridItem } from "../types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { getAllTrendingTags, getTrendingTags } from "../../../api/hive";
import { TrendingTag } from "../../../store/trending-tags/types";

interface Props {
  settings: ReloadableDeckGridItem["settings"];
  draggable?: DraggableProvidedDragHandleProps;
}

export const DeckTopicsColumn = ({ settings, draggable }: Props) => {
  const [data, setData] = useState<TrendingTag[]>([]);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (data.length) {
      setIsReloading(true);
    }

    try {
      const response = await getAllTrendingTags();
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
        title: "Topics",
        subtitle: "The most popular",
        icon: null,
        updateIntervalMs: settings.updateIntervalMs
      }}
      data={data}
      isReloading={isReloading}
      onReload={() => fetchData()}
      onRemove={() => {}}
      skeletonItem={<ShortListItemSkeleton />}
    >
      {(item: TrendingTag, measure: Function, index: number) => (
        <HotListItem onMounted={() => measure()} index={index + 1} entry={item} />
      )}
    </GenericDeckColumn>
  );
};
