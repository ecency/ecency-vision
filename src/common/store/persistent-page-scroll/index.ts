import { Actions, ActionTypes, PersistentPageScrollState, SavePageScrollAction, SavePageScrollData } from './types';
import { Dispatch } from 'redux';

export const initialState: PersistentPageScrollState = {};

export default (state: PersistentPageScrollState = initialState, action: Actions): PersistentPageScrollState => {
  switch (action.type) {
    case ActionTypes.SAVE_PAGE_SCROLL:
      const { data } = action;

      state[data.pageName] = { scroll: data.scrollValue };
      return state;
    default:
      return state;
  }
}

/* Actions */
export const savePageScroll = (data: SavePageScrollData) => (dispatch: Dispatch) => {
  dispatch(savePageAct(data));
}

/* Action Creators */
export const savePageAct = (data: SavePageScrollData): SavePageScrollAction => ({
  type: ActionTypes.SAVE_PAGE_SCROLL,
  data
});