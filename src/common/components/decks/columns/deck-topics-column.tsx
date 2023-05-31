import React, { useContext, useEffect, useState } from "react";
import { HotListItem, ShortListItemSkeleton } from "./deck-items";
import { GenericDeckWithDataColumn } from "./generic-deck-with-data-column";
import { ReloadableDeckGridItem } from "../types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { getAllTrendingTags } from "../../../api/hive";
import { TrendingTag } from "../../../store/trending-tags/types";
import { DeckGridContext } from "../deck-manager";
import { DeckTopicsContentViewer } from "./content-viewer/deck-topics-content-viewer";
import { _t } from "../../../i18n";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../../../util/local-storage";

interface Props {
  id: string;
  settings: ReloadableDeckGridItem["settings"];
  draggable?: DraggableProvidedDragHandleProps;
}

type IdentifiableTrendingTag = TrendingTag & Required<{ id: string }>;

export const DeckTopicsColumn = ({ id, settings, draggable }: Props) => {
  const [data, setData] = useState<IdentifiableTrendingTag[]>([]);
  const [isReloading, setIsReloading] = useState(false);
  const [isFirstLoaded, setIsFirstLoaded] = useState(false);

  const [currentViewingTopic, setCurrentViewingTopic] = useLocalStorage<string | null>(
    PREFIX + `_dtop_cvt`,
    null
  );

  const { updateColumnIntervalMs } = useContext(DeckGridContext);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (data.length) {
      setIsReloading(true);
    }

    try {
      const response: TrendingTag[] = await getAllTrendingTags();
      response.sort((a, b) => (a.top_posts + a.comments > b.top_posts + b.comments ? -1 : 1));
      setData(response.map((item) => ({ ...item, id: item.name })) ?? []);
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
        title: _t("decks.columns.topics"),
        subtitle: _t("decks.columns.topics-subtitle"),
        icon: null,
        updateIntervalMs: settings.updateIntervalMs,
        setUpdateIntervalMs: (v) => updateColumnIntervalMs(id, v)
      }}
      data={data}
      isReloading={isReloading}
      isFirstLoaded={isFirstLoaded}
      onReload={() => fetchData()}
      skeletonItem={<ShortListItemSkeleton />}
      contentViewer={
        currentViewingTopic ? (
          <DeckTopicsContentViewer
            topic={currentViewingTopic}
            backTitle={_t("decks.columns.topics")}
            onClose={() => setCurrentViewingTopic(null)}
          />
        ) : undefined
      }
    >
      {(item: TrendingTag, measure: Function, index: number) => (
        <HotListItem
          onClick={() => setCurrentViewingTopic(item.name)}
          onMounted={() => measure()}
          index={index + 1}
          entry={item}
        />
      )}
    </GenericDeckWithDataColumn>
  );
};
