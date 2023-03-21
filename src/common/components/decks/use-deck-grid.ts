import { useMappedStore } from "../../store/use-mapped-store";
import { useState } from "react";
import { DEFAULT_LAYOUT } from "./consts";

export const useDeckGrid = () => {
  const { activeUser } = useMappedStore();
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);

  return {
    setLayout,
    layout
  };
};
