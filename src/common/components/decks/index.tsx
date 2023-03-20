import React, { useEffect, useState } from "react";
import { useMappedStore } from "../../store/use-mapped-store";
import { DEFAULT_LAYOUT } from "./consts";
import { useNav } from "../../util/use-nav";
import { DeckAddColumn } from "./deck-add-column";
import "./_deck.scss";
import "./_index.scss";
import { DeckGrid } from "./deck-grid";

export const Decks = () => {
  const { activeUser } = useMappedStore();
  const { setNavShow } = useNav();

  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [breakpoint, setBreakpoint] = useState<string>("lg");

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
