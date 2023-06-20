import { DirectMessage } from "./../../../providers/message-provider-types";
import { Dispatch } from "redux";

import {
  Chat,
  Actions,
  ActionTypes,
  DirectContactsAction,
  DirectContactsType,
  DirectMessagesAction,
  ResetChatAction
} from "./types";

export const initialState: Chat = {
  directContacts: [],
  directMessages: []
};

export default (state: Chat = initialState, action: Actions): Chat => {
  switch (action.type) {
    case ActionTypes.DIRECTCONTACTS: {
      const { data } = action;
      const uniqueDirectContacts = data.filter(
        (contact) => !state.directContacts.includes(contact)
      );
      return {
        ...state,
        directContacts: [...state.directContacts, ...uniqueDirectContacts]
      };
    }
    case ActionTypes.DIRECTMESSAGES: {
      const { data } = action;
      return {
        ...state,
        directMessages: [...state.directMessages, ...data]
      };
    }

    case ActionTypes.RESET:
      return initialState;

    default:
      return state;
  }
};

/* Actions */
export const addDirectContacts = (data: DirectContactsType[]) => (dispatch: Dispatch) => {
  dispatch(addDirectContactsAct(data));
};

export const addDirectMessages = (data: DirectMessage[]) => (dispatch: Dispatch) => {
  dispatch(addDirectMessagesAct(data));
};

export const resetChat = () => (dispatch: Dispatch) => {
  dispatch(resetChatAct());
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

export const resetChatAct = (): ResetChatAction => {
  return {
    type: ActionTypes.RESET
  };
};
