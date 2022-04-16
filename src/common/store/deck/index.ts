import {
  Actions,
  ActionTypes,
  CreateAction,
  DeckState,
  ReOrderAction,
  SetDataAction,
  SetReloadingAction
} from './types';
import { Dispatch } from 'redux';
import { createDeckReducer, setDataReducer, setReloadingReducer } from './reducers';
import { reorderReducer } from './reducers/reorderReducer';

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
  }
  return state;
};

export const createDeck = (data: CreateAction['data']) => (dispatch: Dispatch) => dispatch(createAct(data));

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

export * from './actions';