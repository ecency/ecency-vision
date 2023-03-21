import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DraggableProvidedDragHandleProps
} from "react-beautiful-dnd";

interface Props {
  children: ((draggable?: DraggableProvidedDragHandleProps) => JSX.Element)[];
}

export const DeckGrid = ({ children }: Props) => {
  const onDragEnd = () => {};

  const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
    ...draggableStyle
  });

  return (
    <div className="deck-grid">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable" direction="horizontal">
          {(provided, snapshot) => (
            <div ref={provided.innerRef} {...provided.droppableProps} id="draggable-container">
              {children.map((item, index) => (
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
                        {item(provided.dragHandleProps)}
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
