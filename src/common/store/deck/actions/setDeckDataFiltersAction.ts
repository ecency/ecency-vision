import { DeckState, SetDataFiltersAction } from "../types";
import { Dispatch } from "redux";
import { setDataFiltersAct } from "../acts";
import { set } from "../../../util/local-storage";
import { serializeDecks } from "../helpers";

export const setDeckDataFilters =
  (data: SetDataFiltersAction["data"]) =>
  (dispatch: Dispatch, getState: () => { deck: DeckState }) => {
    dispatch(setDataFiltersAct(data));

    const { items } = getState().deck;
    if (!data.username) {
      data.username = "anonymous";
    }
    set(`user-${data.username}-decks`, serializeDecks(items));
  };
