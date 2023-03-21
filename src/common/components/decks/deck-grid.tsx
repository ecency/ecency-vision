import React, { CSSProperties } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useMappedStore } from "../../store/use-mapped-store";
import { _t } from "../../i18n";

interface Props {
  children: JSX.Element[];
}

export const DeckGrid = ({ children }: Props) => {
  const { global } = useMappedStore();

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
                <Draggable key={item.key + "" + index} draggableId={item.key + ""} index={index}>
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
                        {...provided.dragHandleProps}
                        style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                        id={item.key + ""}
                      >
                        {item}
                      </div>
                    );
                  }}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
