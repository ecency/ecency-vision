import React, { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  resetServerContext,
} from "react-beautiful-dnd";
import { Deck } from "../deck";

// fake data generator
export const getItems = (decks: any[]) =>
  decks.map((k, index) => ({
    id: `item-${index}`,
    content: `item ${index}`,
    ...decks[index],
  }));

// a little function to help us with reordering the result
const reorder = (list: any, startIndex: any, endIndex: any) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: boolean, theme: string) => ({
  background: theme === "night" ? "#232e3b" : "#e9f2fc",
  display: "flex",
  padding: grid,
  paddingBottom: grid*4,
  overflow: "auto",
});

resetServerContext();

const DraggableDeckView = ({
  decks,
  toggleListStyle,
  loading,
  ...rest
}: any) => {
  const [items, setItems] = useState<any>(getItems(decks));

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const reorderedItems = reorder(
      items,
      result.source.index,
      result.destination.index
    );

    setItems(reorderedItems);
  };

  useEffect(() => {
    setItems(decks);
  }, [decks]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable" direction="horizontal">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver, rest.global.theme)}
            {...provided.droppableProps}
          >
            {items.map((item: any, index: any) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getItemStyle(
                      snapshot.isDragging,
                      provided.draggableProps.style
                    )}
                  >
                    <Deck
                      toggleListStyle={toggleListStyle}
                      {...item}
                      {...rest}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {loading && (
              <div className="d-flex justify-content-center align-items-center h-100 w-100 deck">
                <div
                  className="spinner-border text-primary spinner-border"
                  role="status"
                >
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export { DraggableDeckView };
