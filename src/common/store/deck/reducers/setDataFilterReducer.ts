import { DeckState, SetDataFiltersAction } from "../types";

export function setDataFilterReducer(
  state: DeckState,
  data: SetDataFiltersAction["data"]
): DeckState {
  const { title, dataFilters } = data;
  const deck = state.items.find((d) => d.header.title === title);

  if (!deck) {
    return state;
  }

  deck.dataFilters = dataFilters;

  const index = state.items.indexOf(deck);
  const items = [...state.items];
  items[index] = deck;

  return {
    ...state,
    items
  };
}
