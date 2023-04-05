import React, { useContext, useEffect } from "react";
import { _t } from "../../../i18n";
import { DeckHeader } from "../header/deck-header";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { useMappedStore } from "../../../store/use-mapped-store";
import { AutoSizer, CellMeasurer, CellMeasurerCache, Grid, List } from "react-virtualized";
import { DeckGridContext } from "../deck-manager";

export interface DeckProps {
  id: string;
  header: {
    title: string;
    subtitle: string;
    icon: any;
    updateIntervalMs: number;
    setUpdateIntervalMs: (v: number) => void;
  };
  data: any[];
  onReload: () => void;
  draggable?: DraggableProvidedDragHandleProps;
  isReloading: boolean;
  children: (item: any, measure: Function, index: number) => JSX.Element;
  skeletonItem: JSX.Element;
}

export const GenericDeckColumn = ({
  header,
  data,
  onReload,
  draggable,
  isReloading,
  children,
  skeletonItem,
  id
}: DeckProps) => {
  const { activeUser } = useMappedStore();

  const { deleteColumn } = useContext(DeckGridContext);

  const cache = new CellMeasurerCache({
    defaultHeight: 431,
    fixedWidth: true,
    defaultWidth: Math.min(400, window.innerWidth)
  });
  const notificationTranslated = _t("decks.notifications");
  const containerClass = header.title.includes(notificationTranslated) ? "list-body pb-0" : "";

  return (
    <div className={`deck ${containerClass}`}>
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
        className={`item-container h-100 ${
          header.title.includes("Wallet") ? "transaction-list" : ""
        }`}
      >
        {data.length ? (
          <AutoSizer>
            {({ height, width }) => (
              <List
                overscanRowCount={0}
                height={height}
                width={width}
                rowCount={data.length}
                rowRenderer={({ key, index, style, parent }) => (
                  <CellMeasurer
                    cache={cache}
                    columnIndex={0}
                    key={key}
                    parent={parent}
                    rowIndex={index}
                  >
                    {({ measure, registerChild }) => (
                      <div ref={registerChild as any} className="virtual-list-item" style={style}>
                        {children(data[index], measure, index)}
                      </div>
                    )}
                  </CellMeasurer>
                )}
                deferredMeasurementCache={cache}
                rowHeight={cache.rowHeight}
              />
            )}
          </AutoSizer>
        ) : (
          <div className="skeleton-list">
            {Array.from(Array(20).keys()).map(() => skeletonItem)}
          </div>
        )}
      </div>
    </div>
  );
};
