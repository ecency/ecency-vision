import React, { useContext, useState } from "react";
import { DeckGridContext } from "../deck-manager";
import "./_deck-toolbar-manager.scss";
import { addIconSvg, settingsIconSvg } from "../icons";
import { DecksSettings } from "../deck-settings/decks-settings";
import { DeckGrid } from "../types";
import { _t } from "../../../i18n";
import { Button } from "@ui/button";

interface Props {
  isExpanded: boolean;
}

export const DeckToolbarManager = ({ isExpanded }: Props) => {
  const { setActiveDeck, decks, activeDeck } = useContext(DeckGridContext);

  const [showDecksSettings, setShowDecksSettings] = useState(false);
  const [editingDeck, setEditingDeck] = useState<DeckGrid | undefined>(undefined);

  return (
    <div className="deck-toolbar-manager">
      <div className="title">
        <div className="text">{_t("decks.decks")}</div>
        <div className="add-deck-btn btn" onClick={() => setShowDecksSettings(true)}>
          {addIconSvg}
        </div>
      </div>
      <div className="deck-list">
        {decks.decks.map((deck) => (
          <div
            key={deck.key}
            className={"deck-list-item " + (deck.key === activeDeck ? "selected" : "")}
            onClick={() => setActiveDeck(deck.key)}
          >
            <div className="icon">{deck.icon ? deck.icon : deck.title[0]}</div>
            {isExpanded ? (
              <div className="title px-0">
                {deck.title}
                {deck.storageType === "local" ? (
                  <div className="local">{_t("decks.local")}</div>
                ) : (
                  <></>
                )}
              </div>
            ) : (
              <></>
            )}
            {isExpanded ? (
              <Button
                appearance="link"
                onClick={(e: { stopPropagation: () => void }) => {
                  e.stopPropagation();
                  setEditingDeck(deck);
                  setShowDecksSettings(true);
                }}
                icon={settingsIconSvg}
              />
            ) : (
              <></>
            )}
          </div>
        ))}
      </div>
      <DecksSettings deck={editingDeck} show={showDecksSettings} setShow={setShowDecksSettings} />
    </div>
  );
};
