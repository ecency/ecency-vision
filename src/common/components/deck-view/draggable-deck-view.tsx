import React, { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable, resetServerContext } from "react-beautiful-dnd";
import { _t } from "../../i18n";
import { Deck } from "../deck";
import { success } from "../feedback";

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  ...draggableStyle
});

const getListStyle = (isDraggingOver: boolean, theme: string) => ({
  background: theme === "night" ? "#232e3b" : "#e9f2fc",
  display: "flex",
  padding: "0 80px 16px 28px",
  overflow: "auto",
  scrollBehavior: "smooth"
});

resetServerContext();

const DraggableDeckView = ({
  deck,
  user,
  toggleListStyle,
  loading,
  setDecks,
  onReloadColumn,
  reorderDecks,
  deleteDeck,
  ...rest
}: any) => {
  const [mounted, setMounted] = useState(false);

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }
    reorderDecks({ startIndex: result.source.index, endIndex: result.destination.index }, user);
  };

  useEffect(() => setMounted(true), []);

  return mounted ? (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable" direction="horizontal">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver, rest.global.theme) as any}
            {...provided.droppableProps}
            id="draggable-container"
          >
            {deck.items.map((item: any, index: any) => (
              <Draggable key={item.id + index} draggableId={item.id} index={index}>
                {(provided, snapshot) => {
                  const notificationTranslated = _t("decks.notifications");
                  const containerClass = item.header.title.includes(notificationTranslated)
                    ? "list-body pb-0"
                    : "";

                  return (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
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
                          deleteDeck(option, user);
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
                <div className="spinner-border text-primary spinner-border" role="status">
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
