import React, { useEffect, useState } from "react";
import { SearchListItem } from "./deck-items";
import { GenericDeckColumn } from "./generic-deck-column";
import { CommunityDeckGridItem } from "../types";
import { getPostsRanked } from "../../../api/bridge";
import { Entry } from "../../../store/entries/types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";

interface Props {
  settings: CommunityDeckGridItem["settings"];
  draggable?: DraggableProvidedDragHandleProps;
}

export const DeckCommunityColumn = ({ settings, draggable }: Props) => {
  const [data, setData] = useState<Entry[]>([]);
  const [isReloading, setIsReloading] = useState(false);

  const titles = {
    trending: "Trending",
    created: "New",
    hot: "Hot",
    payout: "Payouts",
    muted: "Muted"
  };

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
        subtitle: titles[settings.contentType] ?? "User",
        icon: null,
        updateIntervalMs: settings.updateIntervalMs
      }}
      listItemComponent={SearchListItem}
      data={data}
      isReloading={isReloading}
      onReload={() => fetchData()}
      onRemove={() => {}}
    />
  );
};
