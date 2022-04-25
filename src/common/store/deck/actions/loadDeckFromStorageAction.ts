import { Dispatch } from 'redux';
import { get } from '../../../util/local-storage';
import { SerializedDeckModel } from '../types';
import { initDecks } from '../helpers';
import { createAct } from '../index';
import { AppState } from '../../index';

export const loadDeckFromStorage = (username: string) => (dispatch: Dispatch, getState:() => AppState) => {
  const rawDecks = get(`user-${username}-decks`, []) as SerializedDeckModel[];
  const decks = initDecks(rawDecks);
  const existingDecks = getState().deck.items;

  decks
    .filter((d) => !existingDecks.length || existingDecks.some(ed => d.header.title !== ed.header.title))
    .forEach(({
      listItemComponent,
      dataParams,
      header: { title, icon,  updateIntervalMs},
      createdAt,
      dataFilters,
    }) => {
      dispatch(createAct([listItemComponent, title, icon, dataParams, createdAt, updateIntervalMs, dataFilters]));
    });
}