import { Actions, ActionTypes, DeckState } from "./types";
import {
  createDeckReducer,
  deleteAllDecksReducer,
  deleteDeckReducer,
  reorderReducer,
  setDataFilterReducer,
  setDataReducer,
  setReloadingReducer,
  setUpdateIntervalReducer
} from "./reducers";

export const initialState: DeckState = { items: [], isContentLoading: false };

export * from "./actions";
export * from "./acts";

export default (state: DeckState = initialState, action: Actions): DeckState => {
  if (action.type === ActionTypes.CREATE) {
    return createDeckReducer(state, action.data);
  } else if (action.type === ActionTypes.SET_DATA) {
    return setDataReducer(state, action.data);
  } else if (action.type === ActionTypes.SET_RELOADING) {
    return setReloadingReducer(state, action.data);
  } else if (action.type === ActionTypes.REORDER) {
    return reorderReducer(state, action.data);
  } else if (action.type === ActionTypes.DELETE) {
    return deleteDeckReducer(state, action.data);
  } else if (action.type === ActionTypes.UPDATE_INTERVAL) {
    return setUpdateIntervalReducer(state, action.data);
  } else if (action.type === ActionTypes.SET_DATA_FILTERS) {
    return setDataFilterReducer(state, action.data);
  } else if (action.type === ActionTypes.DELETE_ALL) {
    return deleteAllDecksReducer(state);
  }
  return state;
};
