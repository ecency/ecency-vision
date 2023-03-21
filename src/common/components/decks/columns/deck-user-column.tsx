import React, { useEffect, useState } from "react";
import { SearchListItem } from "./deck-items";
import { GenericDeckColumn } from "./generic-deck-column";
import { UserDeckGridItem } from "../types";
import { getAccountPosts } from "../../../api/bridge";
import { Entry } from "../../../store/entries/types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";

interface Props {
  settings: UserDeckGridItem["settings"];
  draggable?: DraggableProvidedDragHandleProps;
}

export const DeckUserColumn = ({ settings, draggable }: Props) => {
  const [data, setData] = useState<Entry[]>([]);
  const titles = {
    posts: "Posts"
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getAccountPosts(settings.contentType, settings.username);
      setData(response ?? []);
    } catch (e) {}
  };

  return (
    <GenericDeckColumn
      draggable={draggable}
      header={{
        title: "@" + settings.username.toLowerCase(),
        subtitle: titles[settings.contentType] ?? "User",
        icon: null,
        updateIntervalMs: 100
      }}
      listItemComponent={SearchListItem}
      data={data}
      onReloadColumn={() => {}}
      onRemove={() => {}}
    />
  );
};
