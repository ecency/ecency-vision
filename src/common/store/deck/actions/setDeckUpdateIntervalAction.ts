import { UpdateIntervalAction } from '../types';
import { Dispatch } from 'redux';
import { updateIntervalAct } from '../index';
import { set } from '../../../util/local-storage';
import { serializeDecks } from '../helpers';
import { AppState } from '../../index';

export const setDeckUpdateInterval = (data: UpdateIntervalAction['data'], username: string) => (dispatch: Dispatch, getState: () => AppState) => {
  dispatch(updateIntervalAct(data));

  const { items } = getState().deck;
  set(`user-${username}-decks`, serializeDecks(items));
}