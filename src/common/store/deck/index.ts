import {
  Actions,
  ActionTypes,
  CreateAction,
  DeckState,
  DeleteAction,
  ReOrderAction,
  SetDataAction,
  SetReloadingAction
} from './types';
import { Dispatch } from 'redux';
import { createDeckReducer, deleteDeckReducer, setDataReducer, setReloadingReducer } from './reducers';
import { reorderReducer } from './reducers/reorderReducer';
import { set } from '../../util/local-storage';
import { serializeDecks } from './helpers';
import { AppState } from '../index';

export const initialState: DeckState = { items: [], isContentLoading: false };

export default (state: DeckState = initialState, action: Actions): DeckState => {
  if (action.type ===ActionTypes.CREATE) {
    return createDeckReducer(state, action.data);
  } else if (action.type === ActionTypes.SET_DATA) {
    return setDataReducer(state, action.data);
  } else if (action.type === ActionTypes.SET_RELOADING) {
    return setReloadingReducer(state, action.data);
  } else if (action.type === ActionTypes.REORDER) {
    return reorderReducer(state, action.data);
  }  else if (action.type === ActionTypes.DELETE) {
    return deleteDeckReducer(state, action.data);
  }
  return state;
};

export const createDeck = (data: CreateAction['data'], username: string) => (dispatch: Dispatch, getState: () => AppState) => {
  dispatch(createAct(data));

  const { items } = getState().deck;
  set(`user-${username}-decks`, serializeDecks(items));
}

export const createAct = (data: CreateAction['data']): CreateAction => ({
  type: ActionTypes.CREATE,
  data,
});

export const setDataAct = (data: SetDataAction['data']): SetDataAction => ({
  type: ActionTypes.SET_DATA,
  data,
});

export const setReloadingAct = (data: SetReloadingAction['data']): SetReloadingAction => ({
  type: ActionTypes.SET_RELOADING,
  data,
});

export const reorderAct = (data: ReOrderAction['data']): ReOrderAction => ({
  type: ActionTypes.REORDER,
  data,
});

export const deleteAct = (data: DeleteAction['data']): DeleteAction => ({
  type: ActionTypes.DELETE,
  data,
});

export * from './actions';