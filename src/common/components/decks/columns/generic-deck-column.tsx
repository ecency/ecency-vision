import React, { useContext, useEffect, useRef, useState } from "react";
import { _t } from "../../../i18n";
import { DeckHeader } from "../header/deck-header";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { useMappedStore } from "../../../store/use-mapped-store";
import { AutoSizer, CellMeasurer, CellMeasurerCache, List } from "react-virtualized";
import { DeckGridContext } from "../deck-manager";
import { Button } from "react-bootstrap";
import { upArrowSvg } from "../../../img/svg";
import { Data } from "node-cache";

type DataItem = Omit<any, "id"> & Required<{ id: string | number }>;

export interface DeckProps {
  id: string;
  header: {
    title: string;
    subtitle: string;
    icon: any;
    updateIntervalMs: number;
    setUpdateIntervalMs: (v: number) => void;
    additionalSettings?: JSX.Element;
  };
  data: DataItem[];
  onReload: () => void;
  draggable?: DraggableProvidedDragHandleProps;
  isReloading: boolean;
  children: (item: any, measure: Function, index: number) => JSX.Element;
  skeletonItem: JSX.Element;
  contentViewer?: JSX.Element;
  isExpanded?: boolean;
  overlay?: JSX.Element;
  newDataComingCondition?: (data: DataItem[]) => boolean;
  isVirtualScroll?: boolean;
}

export const GenericDeckColumn = ({
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
}: DeckProps) => {
  const { activeUser } = useMappedStore();

  const { deleteColumn } = useContext(DeckGridContext);

  const [visibleData, setVisibleData] = useState<DataItem[]>([]);
  const [newComingData, setNewComingData] = useState<DataItem[]>([]);
  const scrollContentRef = useRef<HTMLDivElement | null>(null);

  const cache = new CellMeasurerCache({
    defaultHeight: 431,
    fixedWidth: true,
    defaultWidth: Math.min(400, window.innerWidth)
  });

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

  return (
    <div
      className={`deck ${
        header.title.includes(_t("decks.notifications")) ? "list-body pb-0" : ""
      } ${isExpanded ? "expanded" : ""}`}
    >
      <DeckHeader
        draggable={draggable}
        sticky={true}
        account={activeUser ? activeUser.username : ""}
        {...header}
        onRemove={() => deleteColumn(id)}
        onReload={onReload}
        isReloading={isReloading}
      />
      <div
        className={`item-container position-relative h-100 ${
          header.title.includes("Wallet") ? "transaction-list" : ""
        }`}
      >
        <div className={"new-coming-data " + (newComingData.length > 0 ? "active" : "")}>
          <Button
            variant="primary"
            onClick={() => {
              setVisibleData([...newComingData, ...visibleData]);
              setNewComingData([]);

              // Put it to the end of microtask queue after render
              setTimeout(() => {
                scrollContentRef.current?.scrollTo(0, 0);
              }, 1);
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
      </div>
    </div>
  );
};
