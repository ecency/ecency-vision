import React, { useContext } from "react";
import { DeckGridContext } from "../deck-manager";
import { DeckHeader } from "../header/deck-header";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { useGlobalStore } from "@/core/global-store";
import i18next from "i18next";

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
  draggable?: DraggableProvidedDragHandleProps | null;
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
  const activeUser = useGlobalStore((s) => s.activeUser);

  const { deleteColumn } = useContext(DeckGridContext);

  return (
    <div
      className={`deck ${
        header.title.includes(i18next.t("decks.notifications")) ? "list-body pb-0" : ""
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
        className={`item-container relative h-full ${
          header.title.includes("Wallet") ? "transaction-list" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
};
