import { Dispatch } from 'redux';
import { get } from '../../../util/local-storage';
import { SerializedDeckModel } from '../types';
import { initDecks } from '../helpers';
import { createAct } from '../index';

export const loadDeckFromStorage = (username: string) => (dispatch: Dispatch) => {
  const rawDecks = get(`user-${username}-decks`, []) as SerializedDeckModel[];
  const decks = initDecks(rawDecks);

  decks.forEach(({ listItemComponent, dataParams, header: { title, icon }, createdAt }) => {
    dispatch(createAct([listItemComponent, title, icon, dataParams, createdAt]));
  });
}