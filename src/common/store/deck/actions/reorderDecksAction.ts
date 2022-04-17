import { Dispatch } from 'redux';
import { ReOrderAction } from '../types';
import { reorderAct } from '../index';
import { AppState } from '../../index';
import { set } from '../../../util/local-storage';
import { serializeDecks } from '../helpers';

export const reorderDecks = (data: ReOrderAction['data'], username: string) => (dispatch: Dispatch, getState: () => AppState) => {
  dispatch(reorderAct(data));

  const { items } = getState().deck;
  set(`user-${username}-decks`, serializeDecks(items));
};