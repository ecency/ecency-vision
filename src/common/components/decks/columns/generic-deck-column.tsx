import React, { useEffect } from "react";
import { _t } from "../../../i18n";
import { DeckHeader } from "../header/deck-header";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { useMappedStore } from "../../../store/use-mapped-store";
import { AutoSizer, List } from "react-virtualized";
import { ListItemSkeleton } from "./deck-items";

export interface DeckProps {
  header: { title: string; subtitle: string; icon: any; updateIntervalMs: number };
  listItemComponent: any;
  data: any[];
  onRemove: () => void;
  onReload: () => void;
  draggable?: DraggableProvidedDragHandleProps;
  isReloading: boolean;
}

export const GenericDeckColumn = ({
  header,
  listItemComponent: ListItem,
  data,
  onRemove,
  onReload,
  draggable,
  isReloading
}: DeckProps) => {
  const { activeUser } = useMappedStore();

  const notificationTranslated = _t("decks.notifications");
  const containerClass = header.title.includes(notificationTranslated) ? "list-body pb-0" : "";

  return (
    <div className={`deck ${containerClass}`}>
      <DeckHeader
        draggable={draggable}
        sticky={true}
        account={activeUser ? activeUser.username : ""}
        {...header}
        onRemove={onRemove}
        onReload={onReload}
        isReloading={isReloading}
        updateIntervalMs={10000}
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
                height={height}
                width={width}
                rowCount={data.length}
                rowHeight={431}
                rowRenderer={({ key, index, style }) => (
                  <div className="virtual-list-item" style={style} key={key}>
                    <ListItem
                      index={index + 1}
                      entry={{ ...data[index], toggleNotNeeded: true }}
                      {...data[index]}
                    />
                  </div>
                )}
              />
            )}
          </AutoSizer>
        ) : (
          <div className="skeleton-list">
            {Array.from(Array(20).keys()).map((i, key) => (
              <ListItemSkeleton key={key} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
