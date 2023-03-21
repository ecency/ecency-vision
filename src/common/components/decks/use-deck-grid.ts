import { useMappedStore } from "../../store/use-mapped-store";
import { useState } from "react";
import { DEFAULT_LAYOUT } from "./consts";
import { DeckGridItem } from "./types";

export const useDeckGrid = () => {
  const { activeUser } = useMappedStore();
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);

  const add = (column: DeckGridItem) => {
    const layoutSnapshot = { ...layout };
    layoutSnapshot.columns.push(column);
    setLayout(layoutSnapshot);
  };

  return {
    setLayout,
    layout,
    add
  };
};
