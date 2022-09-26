import { DeckState, DeleteAction } from "../types";

export function deleteDeckReducer(state: DeckState, data: DeleteAction["data"]): DeckState {
  return {
    ...state,
    items: state.items.filter((d) => d.header.title !== data.title)
  };
}
