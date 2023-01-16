import { DeckState, UpdateIntervalAction } from "../types";
import { Dispatch } from "redux";
import { updateIntervalAct } from "../acts";
import * as ls from "../../../util/local-storage";
import { serializeDecks } from "../helpers";

export const setDeckUpdateInterval =
  (data: UpdateIntervalAction["data"], username: string) =>
  (dispatch: Dispatch, getState: () => { deck: DeckState }) => {
    dispatch(updateIntervalAct(data));

    const { items } = getState().deck;
    if (!username) {
      username = "anonymous";
    }
    ls.set(`user-${username}-decks`, serializeDecks(items));
  };
