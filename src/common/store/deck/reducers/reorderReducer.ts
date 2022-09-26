import { DeckState, ReOrderAction } from "../types";

export function reorderReducer(
  state: DeckState,
  { startIndex, endIndex }: ReOrderAction["data"]
): DeckState {
  const items = [...state.items];
  const [removed] = items.splice(startIndex, 1);
  items.splice(endIndex, 0, removed);

  return {
    ...state,
    items
  };
}
