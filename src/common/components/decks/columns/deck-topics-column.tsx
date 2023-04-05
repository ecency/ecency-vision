import React, { useContext, useEffect, useState } from "react";
import { HotListItem, ShortListItemSkeleton } from "./deck-items";
import { GenericDeckColumn } from "./generic-deck-column";
import { ReloadableDeckGridItem } from "../types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { getAllTrendingTags } from "../../../api/hive";
import { TrendingTag } from "../../../store/trending-tags/types";
import { DeckGridContext } from "../deck-manager";

interface Props {
  id: string;
  settings: ReloadableDeckGridItem["settings"];
  draggable?: DraggableProvidedDragHandleProps;
}

export const DeckTopicsColumn = ({ id, settings, draggable }: Props) => {
  const [data, setData] = useState<TrendingTag[]>([]);
  const [isReloading, setIsReloading] = useState(false);

  const { updateColumnIntervalMs } = useContext(DeckGridContext);

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
      id={id}
      draggable={draggable}
      header={{
        title: "Topics",
        subtitle: "The most popular",
        icon: null,
        updateIntervalMs: settings.updateIntervalMs,
        setUpdateIntervalMs: (v) => updateColumnIntervalMs(id, v)
      }}
      data={data}
      isReloading={isReloading}
      onReload={() => fetchData()}
      skeletonItem={<ShortListItemSkeleton />}
    >
      {(item: TrendingTag, measure: Function, index: number) => (
        <HotListItem onMounted={() => measure()} index={index + 1} entry={item} />
      )}
    </GenericDeckColumn>
  );
};
