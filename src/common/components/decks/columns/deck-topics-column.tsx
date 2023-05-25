import React, { useContext, useEffect, useState } from "react";
import { HotListItem, ShortListItemSkeleton } from "./deck-items";
import { GenericDeckWithDataColumn } from "./generic-deck-with-data-column";
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

type IdentifiableTrendingTag = TrendingTag & Required<{ id: string }>;

export const DeckTopicsColumn = ({ id, settings, draggable }: Props) => {
  const [data, setData] = useState<IdentifiableTrendingTag[]>([]);
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
      const response: TrendingTag[] = await getAllTrendingTags();
      setData(response.map((item) => ({ ...item, id: item.name })) ?? []);
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
    </GenericDeckWithDataColumn>
  );
};
