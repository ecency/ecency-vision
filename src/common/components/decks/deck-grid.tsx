import React, { useContext } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { DeckGridContext } from "./deck-manager";
import { DeckAddColumn, DeckUserColumn } from "./columns";
import {
  CommunityDeckGridItem,
  ReloadableDeckGridItem,
  SearchDeckGridItem,
  UserDeckGridItem
} from "./types";
import { Button } from "react-bootstrap";
import { DeckCommunityColumn } from "./columns/deck-community-column";
import { DeckWalletColumn } from "./columns/deck-wallet-column";
import { History } from "history";
import { DeckNotificationsColumn } from "./columns/deck-notifications-column";
import { DeckTrendingColumn } from "./columns/deck-trending-column";
import { DeckTopicsColumn } from "./columns/deck-topics-column";
import { DeckSearchColumn } from "./columns/deck-search-column";

interface Props {
  history: History;
}

export const DeckGrid = ({ history }: Props) => {
  const deckContext = useContext(DeckGridContext);

  const onDragEnd = (result: DropResult) => {
    const originalIndex = +result.draggableId ?? -1;
    const newIndex = result.destination?.index ?? -1;

    if (newIndex > -1 && originalIndex > -1) {
      deckContext.reOrder(originalIndex, newIndex);
    }
  };

  const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
    ...draggableStyle
  });

  return (
    <div className="deck-grid">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable" direction="horizontal">
          {(provided, snapshot) => (
            <div ref={provided.innerRef} {...provided.droppableProps} id="draggable-container">
              {deckContext.layout.columns.map(({ type, id, settings, key }, index) => (
                <Draggable key={index + ""} draggableId={index + ""} index={index}>
                  {(provided, snapshot) => {
                    let transform = provided.draggableProps.style?.transform;

                    if (transform) {
                      transform = transform.replace(/,\s[-+]*\d+px\)/, ", 0px)");
                      provided.draggableProps.style = {
                        ...provided.draggableProps.style,
                        transform
                      };
                    }
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                        id={index + ""}
                      >
                        <div className="d-flex align-items-center" key={key}>
                          {type === "ac" ? (
                            <DeckAddColumn
                              deckKey={key}
                              draggable={provided.dragHandleProps}
                              onRemove={() => {}}
                            />
                          ) : (
                            <></>
                          )}
                          {type === "u" ? (
                            <DeckUserColumn
                              draggable={provided.dragHandleProps}
                              settings={settings as UserDeckGridItem["settings"]}
                            />
                          ) : (
                            <></>
                          )}
                          {type === "co" ? (
                            <DeckCommunityColumn
                              draggable={provided.dragHandleProps}
                              settings={settings as CommunityDeckGridItem["settings"]}
                            />
                          ) : (
                            <></>
                          )}
                          {type === "w" ? (
                            <DeckWalletColumn
                              settings={settings as UserDeckGridItem["settings"]}
                              draggable={provided.dragHandleProps}
                              history={history}
                            />
                          ) : (
                            <></>
                          )}
                          {type === "n" ? (
                            <DeckNotificationsColumn
                              history={history}
                              settings={settings as UserDeckGridItem["settings"]}
                              draggable={provided.dragHandleProps}
                            />
                          ) : (
                            <></>
                          )}
                          {type === "tr" ? (
                            <DeckTrendingColumn
                              draggable={provided.dragHandleProps}
                              settings={settings as ReloadableDeckGridItem["settings"]}
                            />
                          ) : (
                            <></>
                          )}
                          {type === "to" ? (
                            <DeckTopicsColumn
                              settings={settings as ReloadableDeckGridItem["settings"]}
                              draggable={provided.dragHandleProps}
                            />
                          ) : (
                            <></>
                          )}
                          {type === "s" ? (
                            <DeckSearchColumn
                              settings={settings as SearchDeckGridItem["settings"]}
                              draggable={provided.dragHandleProps}
                            />
                          ) : (
                            <></>
                          )}
                          {deckContext.layout.columns.length === index + 1 ? (
                            <Button
                              className="mx-3 add-new-column-button"
                              variant="primary"
                              onClick={() =>
                                deckContext.add({
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
                      </div>
                    );
                  }}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
