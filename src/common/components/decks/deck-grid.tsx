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

  const getListStyle = (isDraggingOver: boolean, theme: string): Partial<CSSProperties> => ({
    background: theme === "night" ? "#232e3b" : "#e9f2fc",
    display: "flex",
    overflow: "auto",
    scrollBehavior: "smooth"
  });

  const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
    ...draggableStyle
  });

  return (
    <div className="deck-grid">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver, global.theme)}
              {...provided.droppableProps}
              id="draggable-container"
            >
              {children.map((item, index) => (
                <Draggable key={item.key + "" + index} draggableId={item.key + ""} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                      id={item.key + ""}
                    >
                      {item}
                    </div>
                  )}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
