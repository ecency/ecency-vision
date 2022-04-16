import { Actions, ActionTypes, CreateAction, DeckState, IdentifiableDeckModel } from './types';
import { Dispatch } from 'redux';

export const initialState: DeckState = [];

export default (state: DeckState = initialState, action: Actions): DeckState => {
  switch (action.type) {
    case ActionTypes.CREATE:
      const [listItemComponent, title, icon, dataParams] = action.data;
      const id = `item-${state.length}`;
      const deck: IdentifiableDeckModel = {
        listItemComponent,
        header: { title, icon },
        dataParams,
        id,
        content: id,
        createdAt: new Date(),
      };
      return [...state, deck];
    default:
      return state;
  }
};

export const createDeck = (data: CreateAction['data']) => (dispatch: Dispatch) => {
  dispatch(createAct(data));
};

export const createAct = (data: CreateAction['data']): CreateAction => {
  return {
    type: ActionTypes.CREATE,
    data,
  };
}