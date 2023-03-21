import { Dispatch } from "redux";
import { deleteAct } from "../acts";
import * as ls from "../../../util/local-storage";
import { serializeDecks } from "../helpers";
import { DeckState } from "../types";

export const deleteDeck =
  (title: string, username: string) =>
  (dispatch: Dispatch, getState: () => { deck: DeckState }) => {
    dispatch(deleteAct({ title }));

    const { items } = getState().deck;
    if (!username) {
      username = "anonymous";
    }
    ls.set(`user-${username}-decks`, serializeDecks(items));
  };
