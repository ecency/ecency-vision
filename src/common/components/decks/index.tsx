import React, { useEffect } from "react";
import { useNav } from "../../util/use-nav";
import "./_deck.scss";
import "./_index.scss";
import { DeckGrid } from "./deck-grid";
import { DeckManager } from "./deck-manager";

export const Decks = () => {
  const { setNavShow } = useNav();

  useEffect(() => {
    setNavShow(false);
  }, []);

  return (
    <DeckManager>
      {() => (
        <div className="decks w-100">
          <div className="toolbar">toolbar</div>
          <div className="decks-container w-100">
            <DeckGrid />
          </div>
        </div>
      )}
    </DeckManager>
  );
};
