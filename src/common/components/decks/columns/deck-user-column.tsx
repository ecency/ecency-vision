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
  const [isReloading, setIsReloading] = useState(false);
  const [isFirstLoading, setIsFirstLoading] = useState(true);

  const titles = {
    posts: "Posts"
  };

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
      setIsFirstLoading(false);
    }
  };

  return (
    <GenericDeckColumn
      draggable={draggable}
      header={{
        title: "@" + settings.username.toLowerCase(),
        subtitle: titles[settings.contentType] ?? "User",
        icon: null,
        updateIntervalMs: 60000
      }}
      listItemComponent={SearchListItem}
      data={data}
      isReloading={isReloading}
      onReload={() => fetchData()}
      onRemove={() => {}}
    />
  );
};
