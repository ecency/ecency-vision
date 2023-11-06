import {
  ChannelUpdate,
  DirectMessage,
  MessagesObject,
  Profile,
  PublicMessage
} from "../../features/chats/managers/message-manager-types";
import { Dispatch } from "redux";

import {
  Actions,
  ActionTypes,
  AddPreviousPublicMessagesAction,
  Chat,
  DeleteDirectMessagesAction,
  DeletePublicMessagesAction,
  DirectMessagesAction,
  LeftChannelsAction,
  ProfilesAction,
  PublicMessagesAction,
  ReplaceDirectMessagesAction,
  ReplacePublicMessagesAction,
  ResetChatAction,
  UpdateChannelAction,
  VerifyDirectMessageSendingAction,
  VerifyPublicMessageSendingAction
} from "./types";

export const initialState: Chat = {
  directMessages: [],
  channels: [],
  publicMessages: [],
  profiles: [],
  leftChannelsList: [],
  updatedChannel: []
};

export default (state: Chat = initialState, action: Actions): Chat => {
  switch (action.type) {
    case ActionTypes.DIRECTMESSAGES: {
      const { peer, data } = action;
      return {
        ...state,
        directMessages: state.directMessages.map((contact) =>
          contact.peer === peer
            ? { peer: peer, chat: { ...contact.chat, [data.id]: data } }
            : contact
        )
      };
    }

    case ActionTypes.RESET:
      return initialState;

    case ActionTypes.PUBLICMESSAGES: {
      const { channelId, data } = action;

      return {
        ...state,
        publicMessages: state.publicMessages.map((obj) =>
          obj.channelId === channelId
            ? {
                channelId: channelId,
                PublicMessage: {
                  ...obj.PublicMessage,
                  [data.id]: data // Add the new message object with its ID as the key
                }
              }
            : obj
        )
      };
    }

    case ActionTypes.PROFILES: {
      const { data } = action;

      const filteredProfiles = data.filter((profile) => {
        return !state.profiles.some((existingProfile) => existingProfile.id === profile.id);
      });

      return {
        ...state,
        profiles: [...state.profiles, ...filteredProfiles]
      };
    }

    case ActionTypes.LEFTCHANNELLIST: {
      const { data } = action;
      return {
        ...state,
        leftChannelsList: [...data]
      };
    }

    case ActionTypes.UPDATEDCHANNEL: {
      const { data } = action;
      return {
        ...state,
        updatedChannel: [...state.updatedChannel, ...data]
      };
    }

    case ActionTypes.REPLACEPUBLICMESSAGE: {
      const { channelId, data } = action;
      const publicChatObject = state.publicMessages.find((item) => item.channelId === channelId);
      const publicChat = publicChatObject?.PublicMessage || {};

      if (publicChat.hasOwnProperty(data.id)) {
        publicChat[data.id] = data;
      } else {
        publicChat[data.id] = data;
      }

      return {
        ...state,
        publicMessages: [
          ...state.publicMessages.map((obj) =>
            obj.channelId === channelId
              ? { channelId: channelId, PublicMessage: { ...publicChat } }
              : obj
          )
        ]
      };
    }

    case ActionTypes.VERIFYPUBLICMESSAGESENDING: {
      const { channelId, data } = action;

      const publicChatObject = state.publicMessages.find((item) => item.channelId === channelId);
      const publicChat = publicChatObject?.PublicMessage || {};

      if (publicChat.hasOwnProperty(data.id)) {
        if (publicChat[data.id].sent === 0) {
          publicChat[data.id].sent = 2;
        }
      }
      return {
        ...state,
        publicMessages: state.publicMessages.map((obj) =>
          obj.channelId === channelId ? { channelId, PublicMessage: { ...publicChat } } : obj
        )
      };
    }

    case ActionTypes.REPLACEDIRECTMESSAGE: {
      const { peer, data } = action;
      const directMessagesObject = state.directMessages.find((item) => item.peer === peer);
      const directMessages = directMessagesObject?.chat || {};

      if (directMessages.hasOwnProperty(data.id)) {
        directMessages[data.id] = data;
      } else {
        directMessages[data.id] = data;
      }

      return {
        ...state,
        directMessages: [
          ...state.directMessages.map((obj) =>
            obj.peer === peer ? { peer, chat: { ...directMessages } } : obj
          )
        ]
      };
    }

    case ActionTypes.VERIFYDIRECTMESSAGESENDING: {
      const { peer, data } = action;

      const directMessagesObject = state.directMessages.find((item) => item.peer === peer);
      const directMessages = directMessagesObject?.chat || {};

      if (directMessages.hasOwnProperty(data.id)) {
        if (directMessages[data.id].sent === 0) {
          directMessages[data.id].sent = 2;
        }
      }
      return {
        ...state,
        directMessages: state.directMessages.map((obj) =>
          obj.peer === peer ? { peer, chat: { ...directMessages } } : obj
        )
      };
    }

    case ActionTypes.DELETEPUBLICMESSAGE: {
      const { channelId, msgId } = action;

      const publicChatObject = state.publicMessages.find((item) => item.channelId === channelId);
      const publicChat = publicChatObject?.PublicMessage || {};

      if (publicChat[msgId]) {
        delete publicChat[msgId];
      }
      return {
        ...state,
        publicMessages: state.publicMessages.map((obj) =>
          obj.channelId === channelId ? { channelId, PublicMessage: { ...publicChat } } : obj
        )
      };
    }

    case ActionTypes.DELETEDIRECTMESSAGE: {
      const { peer, msgId } = action;

      const directMessagesObject = state.directMessages.find((item) => item.peer === peer);
      const directMessages = directMessagesObject?.chat || {};

      if (directMessages[msgId]) {
        delete directMessages[msgId];
      }

      return {
        ...state,
        directMessages: [
          ...state.directMessages.map((obj) =>
            obj.peer === peer ? { peer, chat: { ...directMessages } } : obj
          )
        ]
      };
    }

    case ActionTypes.ADDPREVIOUSPUBLICMESSAGES: {
      const { channelId, data } = action;

      const publicChatObject = state.publicMessages.find((item) => item.channelId === channelId);
      const publicChat = publicChatObject?.PublicMessage || {};

      return {
        ...state,
        publicMessages: state.publicMessages.map((obj) =>
          obj.channelId === channelId
            ? { channelId, PublicMessage: { ...data, ...publicChat } }
            : obj
        )
      };
    }

    default:
      return state;
  }
};

/* Actions */
export const addDirectMessages = (peer: string, data: DirectMessage) => (dispatch: Dispatch) => {
  dispatch(addDirectMessagesAct(peer, data));
};

export const resetChat = () => (dispatch: Dispatch) => {
  dispatch(resetChatAct());
};

export const addPublicMessage =
  (channelId: string, data: PublicMessage) => (dispatch: Dispatch) => {
    dispatch(addPublicMessagesAct(channelId, data));
  };

export const addProfile = (data: Profile[]) => (dispatch: Dispatch) => {
  dispatch(addProfilesAct(data));
};

export const addleftChannels = (data: string[]) => (dispatch: Dispatch) => {
  dispatch(addleftChannelsAct(data));
};

export const UpdateChannels = (data: ChannelUpdate[]) => (dispatch: Dispatch) => {
  dispatch(UpdateChannelsAct(data));
};

export const replacePublicMessage =
  (channelId: string, data: PublicMessage) => (dispatch: Dispatch) => {
    dispatch(replacePublicMessagesAct(channelId, data));
  };

export const verifyPublicMessageSending =
  (channelId: string, data: PublicMessage) => (dispatch: Dispatch) => {
    dispatch(verifyPublicMessageSendingAct(channelId, data));
  };

export const replaceDirectMessage = (peer: string, data: DirectMessage) => (dispatch: Dispatch) => {
  dispatch(replaceDirectMessagesAct(peer, data));
};

export const verifyDirectMessageSending =
  (peer: string, data: DirectMessage) => (dispatch: Dispatch) => {
    dispatch(verifyDirectMessageSendingAct(peer, data));
  };

export const deletePublicMessage = (channelId: string, msgId: string) => (dispatch: Dispatch) => {
  dispatch(deletePublicMessageAct(channelId, msgId));
};

export const deleteDirectMessage = (peer: string, msgId: string) => (dispatch: Dispatch) => {
  dispatch(deleteDirectMessageAct(peer, msgId));
};

export const addPreviousPublicMessages =
  (channelId: string, data: MessagesObject) => (dispatch: Dispatch) => {
    dispatch(addPreviousPublicMessagesAct(channelId, data));
  };

/* Action Creators */

export const addDirectMessagesAct = (peer: string, data: DirectMessage): DirectMessagesAction => {
  return {
    type: ActionTypes.DIRECTMESSAGES,
    peer,
    data
  };
};

export const addPublicMessagesAct = (
  channelId: string,
  data: PublicMessage
): PublicMessagesAction => {
  return {
    type: ActionTypes.PUBLICMESSAGES,
    channelId,
    data
  };
};

export const resetChatAct = (): ResetChatAction => {
  return {
    type: ActionTypes.RESET
  };
};
export const addProfilesAct = (data: Profile[]): ProfilesAction => {
  return {
    type: ActionTypes.PROFILES,
    data
  };
};

export const addleftChannelsAct = (data: string[]): LeftChannelsAction => {
  return {
    type: ActionTypes.LEFTCHANNELLIST,
    data
  };
};

export const UpdateChannelsAct = (data: ChannelUpdate[]): UpdateChannelAction => {
  return {
    type: ActionTypes.UPDATEDCHANNEL,
    data
  };
};

export const replacePublicMessagesAct = (
  channelId: string,
  data: PublicMessage
): ReplacePublicMessagesAction => {
  return {
    type: ActionTypes.REPLACEPUBLICMESSAGE,
    channelId,
    data
  };
};

export const verifyPublicMessageSendingAct = (
  channelId: string,
  data: PublicMessage
): VerifyPublicMessageSendingAction => {
  return {
    type: ActionTypes.VERIFYPUBLICMESSAGESENDING,
    channelId,
    data
  };
};

export const replaceDirectMessagesAct = (
  peer: string,
  data: DirectMessage
): ReplaceDirectMessagesAction => {
  return {
    type: ActionTypes.REPLACEDIRECTMESSAGE,
    peer,
    data
  };
};

export const verifyDirectMessageSendingAct = (
  peer: string,
  data: DirectMessage
): VerifyDirectMessageSendingAction => {
  return {
    type: ActionTypes.VERIFYDIRECTMESSAGESENDING,
    peer,
    data
  };
};

export const deletePublicMessageAct = (
  channelId: string,
  msgId: string
): DeletePublicMessagesAction => {
  return {
    type: ActionTypes.DELETEPUBLICMESSAGE,
    channelId,
    msgId
  };
};

export const deleteDirectMessageAct = (peer: string, msgId: string): DeleteDirectMessagesAction => {
  return {
    type: ActionTypes.DELETEDIRECTMESSAGE,
    peer,
    msgId
  };
};

export const addPreviousPublicMessagesAct = (
  channelId: string,
  data: MessagesObject
): AddPreviousPublicMessagesAction => {
  return {
    type: ActionTypes.ADDPREVIOUSPUBLICMESSAGES,
    channelId,
    data
  };
};
