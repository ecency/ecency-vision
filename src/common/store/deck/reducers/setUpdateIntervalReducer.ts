import { DeckState, UpdateIntervalAction } from "../types";

export function setUpdateIntervalReducer(
  state: DeckState,
  { title, updateIntervalMs }: UpdateIntervalAction["data"]
): DeckState {
  const deck = state.items.find((d) => d.header.title === title);
  if (deck) {
    deck.header.updateIntervalMs = updateIntervalMs;
    return { ...state };
  }
  return state;
}
