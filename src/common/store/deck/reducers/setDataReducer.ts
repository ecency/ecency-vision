import { DeckState, SetDataAction } from "../types";

export function setDataReducer(state: DeckState, actionData: SetDataAction["data"]): DeckState {
  const { title, data } = actionData;
  const deck = state.items.find((d) => d.header.title === title);

  if (!deck) {
    return state;
  }

  deck.data = data;

  const index = state.items.indexOf(deck);
  const items = [...state.items];
  items[index] = deck;

  return {
    ...state,
    items
  };
}
