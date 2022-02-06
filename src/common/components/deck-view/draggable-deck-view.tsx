import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Deck } from "../deck";
import { decks } from "./decks.data";

// fake data generator
const getItems = (items: any) =>
  items.map((k:any) => ({
      ...k,
    id: `item-${k.id}`,
    content: `item ${k.content}`,
  }));

// a little function to help us with reordering the result
const reorder = (list: any, startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "white",

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? "lightblue" : "#e9f2fc",
  display: "flex",
  padding: grid,
  overflow: "auto",
});
export const DraggableDeckView = () => {
  const [items, setItems] = useState<any>(getItems(decks));

  const onDragEnd = (result: any) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const reOrderedItems = reorder(
      items,
      result.source.index,
      result.destination.index
    );
    setItems(reOrderedItems);
  };

  return (
    <div className="decks-container d-flex p-5 mt-5 overflow-auto flex-grow-1">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
              {...provided.droppableProps}
            >
              {items.map((item: any, index: number) => {
                  debugger
                  return (
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
                      index={index + 1}
                      {...item}
                    >{item.content}</div>
                  )}
                </Draggable>
              )})}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
