import { useMappedStore } from "../../../store/use-mapped-store";
import React, { useContext } from "react";
import { DeckGridContext } from "../deck-manager";
import { _t } from "../../../i18n";
import { DeckHeader } from "../header/deck-header";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";

export interface DeckProps<T extends any> {
  id: string;
  header: {
    title: string;
    subtitle?: string;
    icon: any;
    updateIntervalMs?: number;
    setUpdateIntervalMs?: (v: number) => void;
    additionalSettings?: JSX.Element;
  };
  onReload: () => void;
  draggable?: DraggableProvidedDragHandleProps;
  isReloading: boolean;
  children: T;
  isExpanded?: boolean;
}

export const GenericDeckColumn = ({
  header,
  onReload,
  draggable,
  isReloading,
  children,
  id,
  isExpanded
}: DeckProps<any>) => {
  const { activeUser } = useMappedStore();

  const { deleteColumn } = useContext(DeckGridContext);

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
        className={`item-container position-relative h-full ${
          header.title.includes("Wallet") ? "transaction-list" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
};
