import { useMappedStore } from "../../store/use-mapped-store";
import React, { useState } from "react";
import { DEFAULT_LAYOUT } from "./consts";
import { DeckGrid, DeckGridItem } from "./types";
import uuid from "uuid";

interface Context {
  layout: DeckGrid;
  add: (column: Omit<DeckGridItem, "id">) => void;
  reOrder: (originalIndex: number, nextIndex: number) => void;
}

export const DeckGridContext = React.createContext<Context>({
  layout: DEFAULT_LAYOUT,
  add: () => {},
  reOrder: () => {}
});

interface Props {
  children: (context: Context) => JSX.Element;
}

export const DeckManager = ({ children }: Props) => {
  const { activeUser } = useMappedStore();

  const [layout, setLayout] = useState(DEFAULT_LAYOUT);

  const getNextKey = () => Math.max(...layout.columns.map((c) => c.key)) + 1;

  const add = (column: Omit<DeckGridItem, "id">) => {
    const layoutSnapshot = { columns: [...layout.columns] };
    const existingColumnIndex = layoutSnapshot.columns.findIndex((c) => c.key === column.key);
    if (existingColumnIndex > -1) {
      layoutSnapshot.columns[existingColumnIndex] = {
        id: layoutSnapshot.columns[existingColumnIndex].id,
        ...column
      };
    } else {
      column.key = getNextKey();
      layoutSnapshot.columns.push({
        id: uuid.v4(),
        ...column
      });
    }
    setLayout(layoutSnapshot);
  };

  const reOrder = (originalIndex: number, newIndex: number) => {
    if (newIndex === originalIndex) {
      return;
    }

    const hasOriginalIndexColumn = layout.columns[originalIndex] !== undefined;

    if (hasOriginalIndexColumn) {
      const layoutSnapshot = { columns: [...layout.columns] };
      const [column] = layoutSnapshot.columns.splice(originalIndex, 1);

      layoutSnapshot.columns.splice(newIndex, 0, column);

      setLayout(layoutSnapshot);
    }
  };

  return (
    <DeckGridContext.Provider
      value={{
        layout,
        add,
        reOrder
      }}
    >
      {children({ layout, add, reOrder })}
    </DeckGridContext.Provider>
  );
};
