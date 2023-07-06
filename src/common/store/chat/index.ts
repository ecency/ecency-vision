import { DirectMessage } from "./../../../providers/message-provider-types";
import { Dispatch } from "redux";

import {
  Chat,
  Actions,
  ActionTypes,
  DirectContactsAction,
  DirectContactsType,
  DirectMessagesAction,
  ResetChatAction,
  directMessagesList
} from "./types";

export const initialState: Chat = {
  directContacts: [],
  directMessages: []
};

export default (state: Chat = initialState, action: Actions): Chat => {
  switch (action.type) {
    case ActionTypes.DIRECTCONTACTS: {
      const { data } = action;
      const uniqueDirectContacts = data.filter((contact) => {
        return !state.directContacts.some((existingContact) => {
          return existingContact.name === contact.name && existingContact.pubkey === contact.pubkey;
        });
      });
      // console.log(uniqueDirectContacts, "uniqueDirectContacts");
      return {
        ...state,
        directContacts: [...state.directContacts, ...uniqueDirectContacts],
        directMessages: [
          ...state.directMessages,
          ...uniqueDirectContacts.map((contact) => ({ chat: [], peer: contact.pubkey }))
        ]
      };
    }
    case ActionTypes.DIRECTMESSAGES: {
      const { peer, data } = action;
      return {
        ...state,
        directMessages: [
          ...state.directMessages.map((contact) =>
            contact.peer === peer ? { peer: peer, chat: [...contact.chat, ...data] } : contact
          )
        ]
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

export const addDirectMessages = (peer: string, data: DirectMessage[]) => (dispatch: Dispatch) => {
  dispatch(addDirectMessagesAct(peer, data));
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

export const addDirectMessagesAct = (peer: string, data: DirectMessage[]): DirectMessagesAction => {
  return {
    type: ActionTypes.DIRECTMESSAGES,
    peer,
    data
  };
};

export const resetChatAct = (): ResetChatAction => {
  return {
    type: ActionTypes.RESET
  };
};
