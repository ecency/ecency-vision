import React from "react";
import { GenericDeckColumn } from "./generic-deck-column";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import i18next from "i18next";
import { SwapMode } from "@/features/market";

interface Props {
  id: string;
  draggable?: DraggableProvidedDragHandleProps | null;
}

export const DeckMsfColumn = ({ id, draggable }: Props) => {
  return (
    <GenericDeckColumn
      id={id}
      draggable={draggable}
      header={{
        title: i18next.t("decks.columns.swap-form"),
        subtitle: i18next.t("decks.columns.market"),
        icon: null
      }}
      isReloading={false}
      onReload={() => {}}
    >
      <div className="msf-container">
        <div className="pt-5 pb-3 px-3">
          <SwapMode inline={true} />
        </div>
      </div>
    </GenericDeckColumn>
  );
};
