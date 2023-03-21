import React, { useEffect, useState } from "react";
import { useMappedStore } from "../../store/use-mapped-store";
import { useNav } from "../../util/use-nav";
import { DeckAddColumn } from "./columns";
import "./_deck.scss";
import "./_index.scss";
import { DeckGrid } from "./deck-grid";
import { useDeckGrid } from "./use-deck-grid";

export const Decks = () => {
  const { activeUser } = useMappedStore();
  const { setNavShow } = useNav();
  const { layout, setLayout } = useDeckGrid();

  useEffect(() => {
    setNavShow(false);
  }, []);

  return (
    <div className="decks w-100">
      <div className="toolbar">toolbar</div>
      <div className="decks-container w-100">
        <DeckGrid>
          {layout.columns.map(({ type, key, settings }) => (
            <div key={key}>{type === "ac" ? <DeckAddColumn onRemove={() => {}} /> : <></>}</div>
          ))}
        </DeckGrid>
      </div>
    </div>
  );
};
