import { AVAILABLE_THREAD_HOSTS } from "../consts";
import { DeckThreadItemSkeleton, ThreadItem } from "./deck-items";
import { DeckThreadItemViewer } from "./content-viewer";
import { GenericDeckColumn } from "./generic-deck-column";
import React, { useContext, useEffect, useState } from "react";
import { BitesDeckGridItem } from "../types";
import { History } from "history";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { DeckGridContext } from "../deck-manager";
import { _t } from "../../../i18n";
import {
  DeckThreadsColumnManagerContext,
  DeckThreadsContext,
  IdentifiableEntry,
  withDeckThreadsColumnManager
} from "./deck-threads-manager";
import moment from "moment/moment";
import usePrevious from "react-use/lib/usePrevious";
import { getPost } from "../../../api/bridge";

interface Props {
  id: string;
  settings: BitesDeckGridItem["settings"];
  history: History;
  draggable?: DraggableProvidedDragHandleProps;
}

const DeckThreadsColumnComponent = ({ id, settings, history, draggable }: Props) => {
  const { register, detach, reloadingInitiated } = useContext(DeckThreadsContext);
  const { fetch } = useContext(DeckThreadsColumnManagerContext);

  const [data, setData] = useState<IdentifiableEntry[]>([]);
  const [hostGroupedData, setHostGroupedData] = useState<Record<string, IdentifiableEntry[]>>(
    AVAILABLE_THREAD_HOSTS.reduce(
      (acc, host) => ({
        ...acc,
        [host]: []
      }),
      {}
    )
  );
  const prevData = usePrevious<IdentifiableEntry[]>(data);

  const [isReloading, setIsReloading] = useState(false);
  const [currentViewingEntry, setCurrentViewingEntry] = useState<IdentifiableEntry | null>(null);
  const [currentHighlightedEntry, setCurrentHighlightedEntry] = useState<string | undefined>(
    undefined
  );
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
    register(id);
    fetchData();

    return () => {
      detach(id);
    };
  }, []);

  useEffect(() => {
    if (reloadingInitiated) {
      fetchData();
    }
  }, [reloadingInitiated]);

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

      const nextHostGroupedData = AVAILABLE_THREAD_HOSTS.reduce(
        (acc, host) => ({
          ...acc,
          [host]: items.filter((i) => i.host === host)
        }),
        {}
      );
      setHostGroupedData(nextHostGroupedData);
      setData(items);

      setHasHostNextPage({
        ...hasHostNextPage,
        ...usingHosts.reduce(
          (acc, host) => ({
            ...acc,
            [host]: nextHostGroupedData[host].length > 0
          }),
          {}
        )
      });
    } catch (e) {
      console.error(e);
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
        subtitle: _t("decks.columns.threads"),
        icon: null,
        updateIntervalMs: settings.updateIntervalMs,
        setUpdateIntervalMs: (v) => updateColumnIntervalMs(id, v)
      }}
      data={data}
      newDataComingCondition={(newCameData) => {
        const newCame = newCameData.filter((i) => !prevData?.some((it) => i.id === it.id))[0];
        const prevOne = (prevData ?? [])[0];
        return (
          prevData?.length === 0 || moment(newCame?.created).isBefore(moment(prevOne?.created))
        );
      }}
      isReloading={isReloading}
      isVirtualScroll={false}
      isExpanded={!!currentViewingEntry}
      onReload={() => fetchData()}
      skeletonItem={<DeckThreadItemSkeleton />}
      contentViewer={
        currentViewingEntry ? (
          <DeckThreadItemViewer
            entry={currentViewingEntry}
            onClose={() => setCurrentViewingEntry(null)}
            history={history}
            backTitle={`${settings.host}`}
            highlightedEntry={currentHighlightedEntry}
          />
        ) : undefined
      }
    >
      {(item: IdentifiableEntry, measure: Function, index: number) => (
        <ThreadItem
          history={history}
          initialEntry={item}
          onMounted={() => measure()}
          onAppear={() => {
            const hostOnlyThreadItems = hostGroupedData[item.host];
            const isLast = hostOnlyThreadItems[hostOnlyThreadItems.length - 1]?.id === item.id;
            if (isLast && hasHostNextPage[item.host]) {
              fetchData([item.container]);
            }
          }}
          onEntryView={() => setCurrentViewingEntry(item)}
          onResize={() => measure()}
          onSeeFullThread={async () => {
            try {
              const entry = (await getPost(
                item.parent_author,
                item.parent_permlink
              )) as IdentifiableEntry;
              if (entry) {
                entry.id = entry.post_id;
                entry.host = item.host;
                setCurrentViewingEntry(entry);
                setCurrentHighlightedEntry(`${item.author}/${item.permlink}`);
              }
            } catch (e) {}
          }}
        />
      )}
    </GenericDeckColumn>
  );
};

export const DeckThreadsColumn = withDeckThreadsColumnManager(DeckThreadsColumnComponent);
