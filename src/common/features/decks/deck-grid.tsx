import React, { useContext, useEffect, useMemo, useState } from "react";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import { DeckGridContext } from "./deck-manager";
import { DeckAddColumn, DeckUserColumn } from "./columns";
import {
  CommunityDeckGridItem,
  ReloadableDeckGridItem,
  SearchDeckGridItem,
  UserDeckGridItem,
  WavesDeckGridItem
} from "./types";
import { DeckCommunityColumn } from "./columns/deck-community-column";
import { DeckWalletColumn } from "./columns/deck-wallet-column";
import { History } from "history";
import { DeckNotificationsColumn } from "./columns/deck-notifications-column";
import { DeckTrendingColumn } from "./columns/deck-trending-column";
import { DeckTopicsColumn } from "./columns/deck-topics-column";
import { DeckSearchColumn } from "./columns/deck-search-column";
import usePrevious from "react-use/lib/usePrevious";
import * as uuid from "uuid";
import { useOldDeckMigration } from "./old-deck-migration";
import { _t } from "../../i18n";
import { DeckThreadsColumn } from "./columns/deck-threads-column";
import { DeckMsfColumn } from "./columns/deck-msf-column";
import { DeckFaqColumn } from "./columns/deck-faq-column";
import { DeckWalletBalanceColumn } from "./columns/deck-wallet-balance-column";
import { DeckWhatsNewColumn } from "./columns/deck-whats-new-column";
import { Button } from "@ui/button";
import { arrowLeftSvg, arrowRightSvg } from "../../img/svg";

interface Props {
  history: History;
}

export const DeckGrid = ({ history }: Props) => {
  const deckContext = useContext(DeckGridContext);
  const previousLayout = usePrevious(deckContext.layout);

  const [scrollValue, setScrollValue] = useState(0);
  const [addColumnButtonVisible, setAddColumnButtonVisible] = useState(true);
  const [addColumnButtonKey, setAddColumnButtonKey] = useState(uuid.v4());

  const isScrollStarted = useMemo(() => scrollValue > 0, [scrollValue]);
  const isScrollEnded = useMemo(() => {
    const el = document.querySelector("#draggable-container");
    if (el) {
      return Math.round(scrollValue) === Math.round(el.scrollWidth - el.clientWidth);
    }
    return false;
  }, [scrollValue]);

  useOldDeckMigration();

  const onDragEnd = (result: DropResult) => {
    const originalIndex = +result.source?.index ?? -1;
    const newIndex = result.destination?.index ?? -1;

    if (newIndex > -1 && originalIndex > -1) {
      deckContext.reOrder(originalIndex, newIndex);
    }

    setAddColumnButtonVisible(true);
  };

  const onDragStart = () => {
    setAddColumnButtonVisible(false);
  };

  const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
    ...draggableStyle
  });

  useEffect(() => {
    if (deckContext.layout.columns.length > (previousLayout?.columns.length ?? 0)) {
      const cols = deckContext.layout.columns;
      deckContext.scrollTo(cols[cols.length - 1]?.key);
    }
  }, [deckContext.layout]);

  const scrollTo = (direction: "left" | "right") => {
    const el = document.querySelector("#draggable-container");
    if (!el) {
      return;
    }

    if (direction === "left") {
      el.scrollTo(el.scrollLeft - 300, 0);
    } else {
      el.scrollTo(el.scrollLeft + 300, 0);
    }
  };

  return (
    <div className="deck-grid">
      {isScrollStarted && (
        <div
          className="arrow-right hidden md:flex h-full items-center px-3 opacity-25 hover:opacity-50 cursor-pointer duration-300 bg-gradient-to-l from-transparent to-dark-200 fixed left-[72px] w-12 z-30"
          onClick={() => scrollTo("left")}
        >
          {arrowLeftSvg}
        </div>
      )}
      {!isScrollEnded && (
        <div
          className="arrow-right hidden md:flex h-full items-center px-3 opacity-25 hover:opacity-50 cursor-pointer duration-300 bg-gradient-to-r from-transparent to-dark-200 fixed right-0 w-12 z-30"
          onClick={() => scrollTo("right")}
        >
          {arrowRightSvg}
        </div>
      )}
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        <Droppable droppableId="droppable" direction="horizontal">
          {(provided, snapshot) => (
            <div
              className="flex scroll-smooth overflow-x-auto overflow-y-hidden"
              ref={provided.innerRef}
              {...provided.droppableProps}
              id="draggable-container"
              onScroll={(e) => setScrollValue(e.currentTarget.scrollLeft)}
            >
              {deckContext.layout.columns.map(({ type, id, settings, key }, index) => (
                <Draggable key={id} draggableId={id} index={index}>
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
                        <div className="flex items-center" key={key}>
                          {type === "ac" && (
                            <DeckAddColumn
                              id={id}
                              deckKey={key}
                              draggable={provided.dragHandleProps}
                            />
                          )}
                          {type === "u" && (
                            <DeckUserColumn
                              id={id}
                              draggable={provided.dragHandleProps}
                              history={history}
                              settings={settings as UserDeckGridItem["settings"]}
                            />
                          )}
                          {type === "co" && (
                            <DeckCommunityColumn
                              id={id}
                              history={history}
                              draggable={provided.dragHandleProps}
                              settings={settings as CommunityDeckGridItem["settings"]}
                            />
                          )}
                          {type === "w" && (
                            <DeckWalletColumn
                              id={id}
                              settings={settings as UserDeckGridItem["settings"]}
                              draggable={provided.dragHandleProps}
                              history={history}
                            />
                          )}
                          {type === "n" && (
                            <DeckNotificationsColumn
                              id={id}
                              history={history}
                              settings={settings as UserDeckGridItem["settings"]}
                              draggable={provided.dragHandleProps}
                            />
                          )}
                          {type === "tr" && (
                            <DeckTrendingColumn
                              id={id}
                              history={history}
                              draggable={provided.dragHandleProps}
                              settings={settings as ReloadableDeckGridItem["settings"]}
                            />
                          )}
                          {type === "to" && (
                            <DeckTopicsColumn
                              id={id}
                              settings={settings as ReloadableDeckGridItem["settings"]}
                              draggable={provided.dragHandleProps}
                            />
                          )}
                          {type === "s" && (
                            <DeckSearchColumn
                              id={id}
                              settings={settings as SearchDeckGridItem["settings"]}
                              draggable={provided.dragHandleProps}
                              history={history}
                            />
                          )}
                          {type === "th" && (
                            <DeckThreadsColumn
                              id={id}
                              settings={settings as WavesDeckGridItem["settings"]}
                              draggable={provided.dragHandleProps}
                              history={history}
                            />
                          )}
                          {type === "msf" && (
                            <DeckMsfColumn id={id} draggable={provided.dragHandleProps} />
                          )}
                          {type === "faq" && (
                            <DeckFaqColumn id={id} draggable={provided.dragHandleProps} />
                          )}
                          {type === "wb" && (
                            <DeckWalletBalanceColumn
                              id={id}
                              history={history}
                              settings={settings as UserDeckGridItem["settings"]}
                              draggable={provided.dragHandleProps}
                            />
                          )}
                          {type === "wn" && (
                            <DeckWhatsNewColumn
                              id={id}
                              draggable={provided.dragHandleProps}
                              settings={settings as ReloadableDeckGridItem["settings"]}
                            />
                          )}
                        </div>
                      </div>
                    );
                  }}
                </Draggable>
              ))}
              {provided.placeholder}
              <div className="flex items-center">
                <Button
                  key={addColumnButtonKey}
                  className={
                    "mx-3 add-new-column-button " + (addColumnButtonVisible ? "visible" : "")
                  }
                  onClick={() =>
                    deckContext.add({
                      key: deckContext.getNextKey(),
                      type: "ac",
                      settings: {}
                    })
                  }
                >
                  {_t("decks.add-column")}
                </Button>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
