import { Dispatch } from "redux";
import * as ls from "../../../util/local-storage";
import { DeckState, SerializedDeckModel } from "../types";
import { initDecks } from "../helpers";
import { createAct, deleteAllAct } from "../acts";

export const loadDeckFromStorage =
  (username: string, listItems: Record<string, any>) =>
  (dispatch: Dispatch, getState: () => { deck: DeckState }) => {
    dispatch(deleteAllAct());

    if (!username) {
      username = "anonymous";
    }
    const rawDecks = ls.get(`user-${username}-decks`, []) as SerializedDeckModel[];
    const decks = initDecks(rawDecks, listItems);
    const existingDecks = getState().deck.items;

    decks
      .filter(
        (d) =>
          !existingDecks.length || existingDecks.some((ed) => d.header.title !== ed.header.title)
      )
      .forEach(
        ({
          listItemComponent,
          dataParams,
          header: { title, icon, updateIntervalMs },
          createdAt,
          dataFilters
        }) => {
          dispatch(
            createAct([
              listItemComponent,
              title,
              icon,
              dataParams,
              createdAt,
              updateIntervalMs,
              dataFilters
            ])
          );
        }
      );
  };
