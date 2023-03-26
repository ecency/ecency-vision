import React, { useEffect, useState } from "react";
import { ListItemSkeleton, SearchListItem } from "./deck-items";
import { GenericDeckColumn } from "./generic-deck-column";
import { CommunityDeckGridItem } from "../types";
import { getPostsRanked } from "../../../api/bridge";
import { Entry } from "../../../store/entries/types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { communityTitles } from "../consts";

interface Props {
  settings: CommunityDeckGridItem["settings"];
  draggable?: DraggableProvidedDragHandleProps;
}

export const DeckCommunityColumn = ({ settings, draggable }: Props) => {
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
      const response = await getPostsRanked(settings.contentType, "", settings.tag);
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
        subtitle: communityTitles[settings.contentType] ?? "User",
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
