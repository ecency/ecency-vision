import React, { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable, resetServerContext, } from 'react-beautiful-dnd';
import { _t } from '../../i18n';
import { Deck } from '../deck';
import * as ls from '../../util/local-storage';
import { success } from '../feedback';
import { normalizeHeader } from '.';
import { IdentifiableDeckModel } from './types';
import { useDispatch } from 'react-redux';
import { reorderAct } from '../../store/deck';

export const getIdentifiableDeck = (deck: any, index: number): IdentifiableDeckModel => ({
  ...deck,
  id: `item-${index}`,
  content: `item ${index}`,
});

export const getDecks = (decks: any[], user: string | undefined) => {
  const updatedDecks = [...decks].map((deck, index) => {
    const identifiableDeck = getIdentifiableDeck(deck, index);
    identifiableDeck.createdAt = identifiableDeck.createdAt || new Date();
    return identifiableDeck;
  });

  // TODO: Save only deck preferences
  if (user && updatedDecks.length > 0) {
    ls.set(`user-${user}-decks`, updatedDecks);
  } else if (!user && updatedDecks.length > 0) {
    ls.set(`user-unauthed-decks`, updatedDecks);
  }
  return updatedDecks;
};

// a little function to help us with reordering the result
const reorder = (list: any, startIndex: any, endIndex: any) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: boolean, theme: string) => ({
  background: theme === "night" ? "#232e3b" : "#e9f2fc",
  display: "flex",
  padding: "8px 80px 28px 28px",
  overflow: "auto",
  scrollBehavior: "smooth",
});

resetServerContext();

const DraggableDeckView = ({
  deck,
  toggleListStyle,
  loading,
  setDecks,
  onReloadColumn,
  ...rest
}: any) => {
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    dispatch(reorderAct({ startIndex: result.source.index, endIndex: result.destination.index }));
  };

  useEffect(() => setMounted(true), []);

  // useEffect(() => {
  //   if (rest.activeUser && rest.activeUser.username) {
  //     let newItems = ls.get(`user-${rest.activeUser.username}-decks`);
  //     if (newItems) {
  //       let defaultDecks = [...newItems];
  //       defaultDecks = normalizeHeader(defaultDecks);
  //       setDecks(
  //         getDecks(
  //           [...defaultDecks],
  //           (rest.activeUser && rest.activeUser.username) || ""
  //         )
  //       );
  //     }
  //   } else {
  //     let newItems = ls.get(`user-unauthed-decks`);
  //
  //     if (newItems) {
  //       let defaultDecks = [...newItems];
  //       defaultDecks = normalizeHeader(defaultDecks);
  //       setDecks(getDecks([...defaultDecks], undefined));
  //     }
  //   }
  // }, [rest.activeUser]);

  return mounted ? (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable" direction="horizontal">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={
              getListStyle(snapshot.isDraggingOver, rest.global.theme) as any
            }
            {...provided.droppableProps}
            id="draggable-container"
          >
            {deck.items.map((item: any, index: any) => (
              <Draggable
                key={item.id + index}
                draggableId={item.id}
                index={index}
              >
                {(provided, snapshot) => {
                  const notificationTranslated = _t("decks.notifications");
                  const containerClass = item.header.title.includes(
                    notificationTranslated
                  )
                    ? "list-body pb-0"
                    : "";

                  return (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                      id={item.id}
                      className={
                        item.header.title.includes(_t("decks.notifications"))
                          ? "notification-list"
                          : ""
                      }
                    >
                      <Deck
                        toggleListStyle={toggleListStyle}
                        onRemove={(option: string) => {
                          let filteredDecks = deck.items.filter(
                            (item: any) => item.header.title !== option
                          );
                          setDecks(filteredDecks);
                          success(_t("decks.removed", { deck: option }));
                        }}
                        onReloadColumn={onReloadColumn}
                        {...item}
                        {...rest}
                      />
                    </div>
                  );
                }}
              </Draggable>
            ))}
            {provided.placeholder}

            {loading && (
              <div className="d-flex justify-content-center align-items-center h-100 w-100 deck">
                <div
                  className="spinner-border text-primary spinner-border"
                  role="status"
                >
                  <span className="sr-only">{_t("g.loading")}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  ) : null;
};

export { DraggableDeckView };
