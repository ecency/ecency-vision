import React, { useContext, useState } from "react";
import { DeckGridContext } from "../deck-manager";
import "./_deck-toolbar-manager.scss";
import { addIconSvg } from "../icons";
import { DecksSettings } from "../deck-settings/decks-settings";

interface Props {
  isExpanded: boolean;
}

export const DeckToolbarManager = ({ isExpanded }: Props) => {
  const { setActiveDeck, decks, activeDeck } = useContext(DeckGridContext);
  const [showDecksSettings, setShowDecksSettings] = useState(false);

  return (
    <div className="deck-toolbar-manager">
      <div className="title">
        <div className="text">Decks</div>
        <div className="add-deck-btn btn" onClick={() => setShowDecksSettings(true)}>
          {addIconSvg}
        </div>
      </div>
      <div className="deck-list">
        {decks.decks.map(({ icon, key, title }) => (
          <div key={key} className={"deck-list-item " + (key === activeDeck ? "selected" : "")}>
            <div className="icon">{icon}</div>
            {isExpanded ? <div className="title">{title}</div> : <></>}
          </div>
        ))}
      </div>
      <DecksSettings show={showDecksSettings} setShow={setShowDecksSettings} />
    </div>
  );
};
