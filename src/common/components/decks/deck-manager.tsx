import { useMappedStore } from "../../store/use-mapped-store";
import React, { useState } from "react";
import { DEFAULT_LAYOUT } from "./consts";
import { DeckGrid, DeckGridItem } from "./types";

export const DeckGridContext = React.createContext({
  layout: DEFAULT_LAYOUT,
  add: (column: DeckGridItem) => {}
});

interface Props {
  children: (layout: DeckGrid) => JSX.Element;
}

export const DeckManager = ({ children }: Props) => {
  const { activeUser } = useMappedStore();

  const [layout, setLayout] = useState(DEFAULT_LAYOUT);

  const add = (column: DeckGridItem) => {
    const layoutSnapshot = { ...layout };
    const existingColumnIndex = layoutSnapshot.columns.findIndex((c) => c.key === column.key);
    if (existingColumnIndex > -1) {
      layoutSnapshot.columns[existingColumnIndex] = column;
    } else {
      layoutSnapshot.columns.push(column);
    }
    setLayout(layoutSnapshot);
  };

  return (
    <DeckGridContext.Provider
      value={{
        layout,
        add
      }}
    >
      {children(layout)}
    </DeckGridContext.Provider>
  );
};
