import React from "react";
import { GenericDeckColumn } from "./generic-deck-column";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { _t } from "../../../i18n";
import { SwapMode } from "../../market-swap-form/swap-mode";

interface Props {
  id: string;
  draggable?: DraggableProvidedDragHandleProps;
}

export const DeckMsfColumn = ({ id, draggable }: Props) => {
  return (
    <GenericDeckColumn
      id={id}
      draggable={draggable}
      header={{
        title: _t("decks.columns.swap-form"),
        subtitle: _t("decks.columns.market"),
        icon: null
      }}
      isReloading={false}
      onReload={() => {}}
    >
      <div className="msf-container">
        <div className="p-3">
          <SwapMode inline={true} />
        </div>
      </div>
    </GenericDeckColumn>
  );
};
