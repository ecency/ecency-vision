import { DeckState, SetReloadingAction } from "../types";

export function setReloadingReducer(
  state: DeckState,
  { title, isReloading }: SetReloadingAction["data"]
): DeckState {
  const deck = state.items.find((d) => d.header.title === title);

  if (!deck) {
    return state;
  }

  deck.header.reloading = isReloading;
  const index = state.items.indexOf(deck);
  const items = [...state.items];
  items[index] = deck;

  return {
    ...state,
    items
  };
}
