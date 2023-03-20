import { DeckHeader } from "./header/deck-header";
import React from "react";
import { useMappedStore } from "../../store/use-mapped-store";
import { _t } from "../../i18n";

interface Props {
  onRemove: () => void;
}

export const DeckAddColumn = ({ onRemove }: Props) => {
  const { activeUser } = useMappedStore();

  return (
    <div className="deck deck-add-column">
      <DeckHeader
        account={activeUser?.username ?? ""}
        onRemove={onRemove}
        title={_t("decks.add-column")}
      />
    </div>
  );
};
