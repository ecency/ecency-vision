import { DirectMessage } from "./../../../providers/message-provider-types";
import { Dispatch } from "redux";

import {
  Chat,
  Actions,
  ActionTypes,
  DirectContactsAction,
  DirectContactsType,
  DirectMessagesAction
} from "./types";

export const initialState: Chat = {
  directContacts: [],
  directMessages: []
};

export default (state: Chat = initialState, action: Actions): Chat => {
  switch (action.type) {
    case ActionTypes.DIRECTCONTACTS: {
      const { data } = action;
      return {
        ...state,
        directContacts: [...state.directContacts, ...data]
      };
    }
    case ActionTypes.DIRECTMESSAGES: {
      const { data } = action;
      return {
        ...state,
        directMessages: [...state.directMessages, ...data]
      };
    }
    default:
      return state;
  }
};

/* Actions */
export const addDirectContacts = (data: DirectContactsType[]) => (dispatch: Dispatch) => {
  dispatch(addDirectContactsAct(data));
};

export const addDirectMessages = (data: DirectMessage[]) => (dispatch: Dispatch) => {
  console.log("data in store", data);
  dispatch(addDirectMessagesAct(data));
};

/* Action Creators */

export const addDirectContactsAct = (data: DirectContactsType[]): DirectContactsAction => {
  return {
    type: ActionTypes.DIRECTCONTACTS,
    data
  };
};

export const addDirectMessagesAct = (data: DirectMessage[]): DirectMessagesAction => {
  return {
    type: ActionTypes.DIRECTMESSAGES,
    data
  };
};
