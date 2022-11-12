import { Dispatch } from "redux";
import { DeckState, ReOrderAction } from "../types";
import { reorderAct } from "../acts";
import { set } from "../../../util/local-storage";
import { serializeDecks } from "../helpers";

export const reorderDecks =
  (data: ReOrderAction["data"], username: string) =>
  (dispatch: Dispatch, getState: () => { deck: DeckState }) => {
    dispatch(reorderAct(data));

    const { items } = getState().deck;
    if (!username) {
      username = "anonymous";
    }
    set(`user-${username}-decks`, serializeDecks(items));
  };
