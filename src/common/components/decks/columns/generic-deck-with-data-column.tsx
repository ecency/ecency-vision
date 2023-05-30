import React, { useContext, useEffect, useRef, useState } from "react";
import { _t } from "../../../i18n";
import { DeckHeader } from "../header/deck-header";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { useMappedStore } from "../../../store/use-mapped-store";
import { AutoSizer, CellMeasurer, CellMeasurerCache, List } from "react-virtualized";
import { DeckGridContext } from "../deck-manager";
import { Button } from "react-bootstrap";
import { upArrowSvg } from "../../../img/svg";
import { DeckProps, GenericDeckColumn } from "./generic-deck-column";

type DataItem = Omit<any, "id"> & Required<{ id: string | number }>;

export interface DeckWithDataProps
  extends DeckProps<(item: any, measure: Function, index: number) => JSX.Element> {
  data: DataItem[];
  skeletonItem: JSX.Element;
  contentViewer?: JSX.Element;
  overlay?: JSX.Element;
  newDataComingCondition?: (data: DataItem[]) => boolean;
  isVirtualScroll?: boolean;
}

export const GenericDeckWithDataColumn = ({
  header,
  data,
  onReload,
  draggable,
  isReloading,
  children,
  skeletonItem,
  id,
  contentViewer,
  isExpanded,
  overlay,
  newDataComingCondition,
  isVirtualScroll = true
}: DeckWithDataProps) => {
  const { activeUser } = useMappedStore();

  const { deleteColumn } = useContext(DeckGridContext);
  const scrollContentRef = useRef<HTMLDivElement | null>(null);

  const [visibleData, setVisibleData] = useState<DataItem[]>([]);
  const [newComingData, setNewComingData] = useState<DataItem[]>([]);

  const cache = new CellMeasurerCache({
    defaultHeight: 431,
    fixedWidth: true,
    defaultWidth: Math.min(400, window.innerWidth)
  });

  useEffect(() => {
    if (
      newDataComingCondition
        ? newDataComingCondition(data)
        : visibleData.length === 0 || data.length === 0
    ) {
      setVisibleData(data);
    } else {
      const newData = data.filter(({ id }) => !visibleData.some((vd) => vd.id === id));
      setNewComingData(newData);
    }
  }, [data]);

  const virtualScrollContent = (
    <AutoSizer>
      {({ height, width }) => (
        <List
          overscanRowCount={16}
          height={height}
          width={width}
          rowCount={visibleData.length}
          rowRenderer={({ key, index, style, parent }) => (
            <CellMeasurer
              cache={cache}
              columnIndex={0}
              key={visibleData[index].id + key}
              parent={parent}
              rowIndex={index}
            >
              {({ measure, registerChild }) => {
                return (
                  <div
                    key={(visibleData[index].id ?? visibleData[index].post_id) + key}
                    ref={registerChild as any}
                    className="virtual-list-item"
                    style={style}
                  >
                    {children(visibleData[index], measure, index)}
                  </div>
                );
              }}
            </CellMeasurer>
          )}
          deferredMeasurementCache={cache}
          rowHeight={cache.rowHeight}
        />
      )}
    </AutoSizer>
  );

  const nativeScrollContent = (
    <div ref={scrollContentRef} className="native-scroll-content">
      {visibleData.map((item, index) => (
        <div key={visibleData[index].id ?? visibleData[index].post_id}>
          {children(visibleData[index], () => {}, index)}
        </div>
      ))}
    </div>
  );

  return (
    <GenericDeckColumn
      id={id}
      header={header}
      isReloading={isReloading}
      isExpanded={isExpanded}
      onReload={onReload}
      draggable={draggable}
    >
      <div className={"new-coming-data " + (newComingData.length > 0 ? "active" : "")}>
        <Button
          variant="primary"
          onClick={() => {
            setVisibleData([...newComingData, ...visibleData]);
            setNewComingData([]);
          }}
        >
          {upArrowSvg}
          {_t("decks.columns.new-data-available")}
        </Button>
      </div>
      {data.length ? (
        isVirtualScroll ? (
          virtualScrollContent
        ) : (
          nativeScrollContent
        )
      ) : (
        <div className="skeleton-list">
          {Array.from(Array(20).keys()).map((i) => (
            <div key={i}>{skeletonItem}</div>
          ))}
        </div>
      )}
      {contentViewer}
      {overlay && <div className="deck-overlay">{overlay}</div>}
    </GenericDeckColumn>
  );
};
