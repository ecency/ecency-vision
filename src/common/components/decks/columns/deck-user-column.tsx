import React, { useEffect, useState } from "react";
import { ListItemSkeleton, SearchListItem } from "./deck-items";
import { GenericDeckColumn } from "./generic-deck-column";
import { UserDeckGridItem } from "../types";
import { getAccountPosts } from "../../../api/bridge";
import { Entry } from "../../../store/entries/types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { userTitles } from "../consts";

interface Props {
  settings: UserDeckGridItem["settings"];
  draggable?: DraggableProvidedDragHandleProps;
}

export const DeckUserColumn = ({ settings, draggable }: Props) => {
  const [data, setData] = useState<Entry[]>([]);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (data.length) {
      setIsReloading(true);
    }

    try {
      const response = await getAccountPosts(settings.contentType, settings.username);
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
        title: "@" + settings.username.toLowerCase(),
        subtitle: userTitles[settings.contentType] ?? "User",
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
