import { AVAILABLE_THREAD_HOSTS, communityTitles } from "../consts";
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
import { DeckThreadsContext, IdentifiableEntry } from "./deck-threads-manager";
import moment from "moment/moment";
import usePrevious from "react-use/lib/usePrevious";

interface Props {
  id: string;
  settings: BitesDeckGridItem["settings"];
  history: History;
  draggable?: DraggableProvidedDragHandleProps;
}

export const DeckBitesColumn = ({ id, settings, history, draggable }: Props) => {
  const { fetch } = useContext(DeckThreadsContext);

  const [data, setData] = useState<IdentifiableEntry[]>([]);
  const prevData = usePrevious<IdentifiableEntry[]>(data);

  const [isReloading, setIsReloading] = useState(false);
  const [currentViewingEntry, setCurrentViewingEntry] = useState<IdentifiableEntry | null>(null);
  const [hasHostNextPage, setHasHostNextPage] = useState<Record<string, boolean>>(
    AVAILABLE_THREAD_HOSTS.reduce(
      (acc, host) => ({
        ...acc,
        [host]: true
      }),
      {}
    )
  );

  const { updateColumnIntervalMs } = useContext(DeckGridContext);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (sinceEntries?: IdentifiableEntry[]) => {
    try {
      if (data.length) {
        setIsReloading(true);
      }

      const usingHosts = AVAILABLE_THREAD_HOSTS.filter((h) =>
        settings.host === "all" ? true : h === settings.host
      );
      const response = (await fetch(usingHosts, sinceEntries)) as IdentifiableEntry[];

      let items = [...(sinceEntries ? data : []), ...response];

      items.sort((a, b) => (moment(a.created).isAfter(b.created) ? -1 : 1));

      setData(items);

      setHasHostNextPage({
        ...hasHostNextPage,
        ...usingHosts.reduce(
          (acc, host) => ({
            ...acc,
            [host]: response.length > 0
          }),
          {}
        )
      });
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
      newDataComingCondition={(newCameData) =>
        newCameData[newCameData.length - 1]?.id === data[data.length - 1]?.id
      }
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
      {(item: IdentifiableEntry, measure: Function, index: number) => (
        <ThreadItem
          entry={{
            ...item
          }}
          onMounted={() => {
            measure();

            const isLast = data[data.length - 1]?.id === item.id;
            if (isLast && hasHostNextPage[item.host]) {
              fetchData([item.container]);
            }
          }}
          onEntryView={() => setCurrentViewingEntry(item)}
          onResize={() => measure()}
        />
      )}
    </GenericDeckColumn>
  );
};
