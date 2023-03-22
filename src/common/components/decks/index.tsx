import React, { useEffect } from "react";
import { useNav } from "../../util/use-nav";
import { DeckAddColumn, DeckUserColumn } from "./columns";
import "./_deck.scss";
import "./_index.scss";
import { DeckGrid } from "./deck-grid";
import { UserDeckGridItem } from "./types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { DeckManager } from "./deck-manager";
import { Button } from "react-bootstrap";

export const Decks = () => {
  const { setNavShow } = useNav();

  useEffect(() => {
    setNavShow(false);
  }, []);

  return (
    <DeckManager>
      {({ layout, add }) => (
        <div className="decks w-100">
          <div className="toolbar">toolbar</div>
          <div className="decks-container w-100">
            <DeckGrid>
              {layout.columns.map(
                ({ type, key, settings }, index) =>
                  (draggable?: DraggableProvidedDragHandleProps) =>
                    (
                      <div className="d-flex align-items-center" key={key}>
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
                        {layout.columns.length === index + 1 ? (
                          <Button
                            className="mx-3 add-new-column-button"
                            variant="primary"
                            onClick={() =>
                              add({
                                key: Infinity,
                                type: "ac",
                                settings: {}
                              })
                            }
                          >
                            Add new column
                          </Button>
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
