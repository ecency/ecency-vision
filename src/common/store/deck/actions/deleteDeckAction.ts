import { Dispatch } from 'redux';
import { deleteAct } from '../index';
import { set } from '../../../util/local-storage';
import { serializeDecks } from '../helpers';
import { AppState } from '../../index';

export const deleteDeck = (title: string, username: string) => (dispatch: Dispatch, getState: () => AppState) => {
  dispatch(deleteAct({title}));

  const { items } = getState().deck;
  set(`user-${username}-decks`, serializeDecks(items));
};