import { communityTitles } from "../consts";
import { ListItemSkeleton, SearchListItem, ThreadItem } from "./deck-items";
import { DeckPostViewer } from "./content-viewer";
import { GenericDeckColumn } from "./generic-deck-column";
import React, { useContext, useEffect, useState } from "react";
import { BitesDeckGridItem } from "../types";
import { History } from "history";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { Entry } from "../../../store/entries/types";
import { DeckGridContext } from "../deck-manager";
import { _t } from "../../../i18n";
import { DeckThreadsContext } from "./deck-threads-manager";

interface Props {
  id: string;
  settings: BitesDeckGridItem["settings"];
  history: History;
  draggable?: DraggableProvidedDragHandleProps;
}

type IdentifiableEntry = Entry & Required<Pick<Entry, "id">>;

export const DeckBitesColumn = ({ id, settings, history, draggable }: Props) => {
  const { fetch } = useContext(DeckThreadsContext);

  const [data, setData] = useState<IdentifiableEntry[]>([]);
  const [isReloading, setIsReloading] = useState(false);
  const [currentViewingEntry, setCurrentViewingEntry] = useState<Entry | null>(null);

  const { updateColumnIntervalMs } = useContext(DeckGridContext);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const items = await fetch(settings.host);
    setData(
      items.map((item) => {
        item.id = item.post_id;
        return item as IdentifiableEntry;
      })
    );
  };

  return (
    <GenericDeckColumn
      id={id}
      draggable={draggable}
      header={{
        title:
          settings.host === "all"
            ? _t("decks.columns.all-thread-hosts")
            : settings.host.toLowerCase(),
        subtitle: _t("decks.columns.bites"),
        icon: null,
        updateIntervalMs: settings.updateIntervalMs,
        setUpdateIntervalMs: (v) => updateColumnIntervalMs(id, v)
      }}
      data={data}
      isReloading={isReloading}
      isExpanded={!!currentViewingEntry}
      onReload={() => fetchData()}
      skeletonItem={<ListItemSkeleton />}
      contentViewer={
        currentViewingEntry ? (
          <DeckPostViewer
            entry={currentViewingEntry}
            onClose={() => setCurrentViewingEntry(null)}
            history={history}
            backTitle={`${settings.host}`}
          />
        ) : undefined
      }
    >
      {(item: any, measure: Function, index: number) => (
        <ThreadItem
          entry={{
            ...item
          }}
          onMounted={() => measure()}
          onEntryView={() => setCurrentViewingEntry(item)}
        />
      )}
    </GenericDeckColumn>
  );
};
