import React, { useContext, useEffect, useState } from "react";
import { ListItemSkeleton, SearchListItem } from "./deck-items";
import { GenericDeckColumn } from "./generic-deck-column";
import { UserDeckGridItem } from "../types";
import { getAccountPosts } from "../../../api/bridge";
import { Entry } from "../../../store/entries/types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { USER_CONTENT_TYPES, userTitles } from "../consts";
import { DeckGridContext } from "../deck-manager";
import { DeckPostViewer } from "./content-viewer";
import { History } from "history";
import { DeckContentTypeColumnSettings } from "./deck-column-settings/deck-content-type-column-settings";
import usePrevious from "react-use/lib/usePrevious";

interface Props {
  id: string;
  settings: UserDeckGridItem["settings"];
  history: History;
  draggable?: DraggableProvidedDragHandleProps;
}

type IdentifiableEntry = Entry & Required<Pick<Entry, "id">>;

export const DeckUserColumn = ({ id, settings, draggable, history }: Props) => {
  const [data, setData] = useState<IdentifiableEntry[]>([]);
  const [isReloading, setIsReloading] = useState(false);
  const [currentViewingEntry, setCurrentViewingEntry] = useState<Entry | null>(null);

  const { updateColumnIntervalMs } = useContext(DeckGridContext);
  const prevSettings = usePrevious(settings);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (prevSettings && prevSettings?.contentType !== settings.contentType) {
      setData([]);
      fetchData();
    }
  }, [settings.contentType]);

  const fetchData = async () => {
    if (data.length) {
      setIsReloading(true);
    }

    try {
      const response = await getAccountPosts(settings.contentType, settings.username);
      setData((response as IdentifiableEntry[]) ?? []);
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
        title: "@" + settings.username.toLowerCase(),
        subtitle: userTitles[settings.contentType] ?? "User",
        icon: null,
        updateIntervalMs: settings.updateIntervalMs,
        setUpdateIntervalMs: (v) => updateColumnIntervalMs(id, v),
        additionalSettings: (
          <DeckContentTypeColumnSettings
            contentTypes={USER_CONTENT_TYPES}
            settings={settings}
            id={id}
          />
        )
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
            backTitle={`@${settings.username}(${userTitles[settings.contentType]})`}
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
