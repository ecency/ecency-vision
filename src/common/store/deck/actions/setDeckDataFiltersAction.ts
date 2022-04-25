import { SetDataFiltersAction } from '../types';
import { Dispatch } from 'redux';
import { AppState } from '../../index';
import { setDataFiltersAct } from '../index';
import { set } from '../../../util/local-storage';
import { serializeDecks } from '../helpers';

export const setDeckDataFilters = (data: SetDataFiltersAction['data']) => (dispatch: Dispatch, getState: () => AppState) => {
  dispatch(setDataFiltersAct(data));

  const { items } = getState().deck;
  set(`user-${data.username}-decks`, serializeDecks(items));
}