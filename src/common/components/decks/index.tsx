import React, { useEffect } from "react";
import { useNav } from "../../util/use-nav";
import { DeckAddColumn, DeckUserColumn } from "./columns";
import "./_deck.scss";
import "./_index.scss";
import { DeckGrid } from "./deck-grid";
import { UserDeckGridItem } from "./types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { DeckManager } from "./deck-manager";

export const Decks = () => {
  const { setNavShow } = useNav();

  useEffect(() => {
    setNavShow(false);
  }, []);

  return (
    <DeckManager>
      {(layout) => (
        <div className="decks w-100">
          <div className="toolbar">toolbar</div>
          <div className="decks-container w-100">
            <DeckGrid>
              {layout.columns.map(
                ({ type, key, settings }) =>
                  (draggable?: DraggableProvidedDragHandleProps) =>
                    (
                      <div key={key}>
                        {type === "ac" ? (
                          <DeckAddColumn deckKey={key} draggable={draggable} onRemove={() => {}} />
                        ) : (
                          <></>
                        )}
                        {type === "u" ? (
                          <DeckUserColumn
                            draggable={draggable}
                            settings={settings as UserDeckGridItem["settings"]}
                          />
                        ) : (
                          <></>
                        )}
                      </div>
                    )
              )}
            </DeckGrid>
          </div>
        </div>
      )}
    </DeckManager>
  );
};
