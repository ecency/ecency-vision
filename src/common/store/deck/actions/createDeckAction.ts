import { CreateAction, DeckState } from "../types";
import { Dispatch } from "redux";
import { set } from "../../../util/local-storage";
import { serializeDecks } from "../helpers";
import { createAct } from "../acts";

export const createDeck =
  (data: CreateAction["data"], username: string) =>
  (dispatch: Dispatch, getState: () => { deck: DeckState }) => {
    dispatch(createAct(data));

    const { items } = getState().deck;

    if (!username) {
      username = "anonymous";
    }
    set(`user-${username}-decks`, serializeDecks(items));
  };
