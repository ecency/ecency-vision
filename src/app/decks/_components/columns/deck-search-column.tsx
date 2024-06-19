import React, { useContext, useEffect, useState } from "react";
import { ListItemSkeleton, SearchListItem } from "./deck-items";
import { GenericDeckWithDataColumn } from "./generic-deck-with-data-column";
import { SearchDeckGridItem } from "../types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { search, SearchResult } from "../../../api/search-api";
import { DeckGridContext } from "../deck-manager";
import { DeckPostViewer } from "./content-viewer";
import { Entry } from "../../../store/entries/types";
import { History } from "history";
import { DeckSearchColumnSettings } from "./deck-column-settings/deck-search-column-settings";
import moment, { Moment } from "moment/moment";
import { DateOpt } from "../consts";
import usePrevious from "react-use/lib/usePrevious";
import { _t } from "../../../i18n";

interface Props {
  id: string;
  settings: SearchDeckGridItem["settings"];
  history: History;
  draggable?: DraggableProvidedDragHandleProps;
}

export const DeckSearchColumn = ({ id, settings, draggable, history }: Props) => {
  const [data, setData] = useState<SearchResult[]>([]);
  const [isReloading, setIsReloading] = useState(false);
  const [currentViewingEntry, setCurrentViewingEntry] = useState<Entry | null>(null);
  const [isFirstLoaded, setIsFirstLoaded] = useState(false);

  const { updateColumnIntervalMs } = useContext(DeckGridContext);
  const prevSettings = usePrevious(settings);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (JSON.stringify(prevSettings) !== JSON.stringify(settings)) {
      setData([]);
      fetchData();
    }
  }, [settings]);

  const buildQuery = () => {
    let q = settings.query;

    if (settings.author) {
      q += ` author:${settings.author}`;
    }

    if (settings.type) {
      q += ` type:${settings.type}`;
    }

    if (settings.category) {
      q += ` category:${settings.category}`;
    }

    if (settings.tags) {
      q += ` tag:${settings.tags}`;
    }

    return q;
  };

  const fetchData = async () => {
    if (data.length) {
      setIsReloading(true);
    }

    try {
      let sinceDate: undefined | Moment;

      if (settings.date) {
        switch (settings.date) {
          case DateOpt.W:
            sinceDate = moment().subtract("1", "week");
            break;
          case DateOpt.M:
            sinceDate = moment().subtract("1", "month");
            break;
          case DateOpt.Y:
            sinceDate = moment().subtract("1", "year");
            break;
          default:
            sinceDate = undefined;
        }
      }

      const since = sinceDate ? sinceDate.format("YYYY-MM-DDTHH:mm:ss") : undefined;

      const response = await search(
        buildQuery(),
        settings.sort ? settings.sort : "popularity",
        settings.hideLow ? "1" : "0",
        since
      );
      setData(response.results ?? []);
    } catch (e) {
    } finally {
      setIsReloading(false);
      setIsFirstLoaded(true);
    }
  };

  return (
    <GenericDeckWithDataColumn
      id={id}
      draggable={draggable}
      header={{
        title: settings.query,
        subtitle: _t("decks.search-query"),
        icon: null,
        updateIntervalMs: settings.updateIntervalMs,
        setUpdateIntervalMs: (v) => updateColumnIntervalMs(id, v),
        additionalSettings: <DeckSearchColumnSettings id={id} settings={settings} />
      }}
      data={data}
      isExpanded={!!currentViewingEntry}
      isReloading={isReloading}
      isFirstLoaded={isFirstLoaded}
      onReload={() => fetchData()}
      skeletonItem={<ListItemSkeleton />}
      isVirtualScroll={false}
      contentViewer={
        currentViewingEntry ? (
          <DeckPostViewer
            entry={currentViewingEntry}
            history={history}
            onClose={() => setCurrentViewingEntry(null)}
            backTitle={`Query: ${settings.query}`}
          />
        ) : (
          <></>
        )
      }
    >
      {(item: any, measure: Function, index: number) => (
        <SearchListItem
          onMounted={() => measure()}
          marked={true}
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
    </GenericDeckWithDataColumn>
  );
};
