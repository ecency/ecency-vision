import {
  Channel,
  DirectMessage,
  PublicMessage,
  Profile,
  ChannelUpdate
} from "./../../../providers/message-provider-types";
import { Dispatch } from "redux";

import {
  Chat,
  Actions,
  ActionTypes,
  DirectContactsAction,
  DirectContactsType,
  DirectMessagesAction,
  ResetChatAction,
  directMessagesList,
  AddChannelsAction,
  PublicMessagesAction,
  ProfilesAction,
  LeftChannelsAction,
  UpdateChannelAction
} from "./types";

export const initialState: Chat = {
  directContacts: [],
  directMessages: [],
  channels: [],
  publicMessages: [],
  profiles: [],
  leftChannelsList: [],
  updatedChannel: []
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

    case ActionTypes.CHANNELS: {
      const { data } = action;

      return {
        ...state,
        channels: [...state.channels, ...data],
        publicMessages: [
          ...state.publicMessages,
          ...data.map((channel) => ({ channelId: channel.id, PublicMessage: [] }))
        ]
      };
    }

    case ActionTypes.PUBLICMESSAGES: {
      const { channelId, data } = action;
      return {
        ...state,
        publicMessages: [
          ...state.publicMessages.map((obj) =>
            obj.channelId === channelId
              ? { channelId: channelId, PublicMessage: [...obj.PublicMessage, ...data] }
              : obj
          )
        ]
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

export const addChannels = (data: Channel[]) => (dispatch: Dispatch) => {
  dispatch(addChannelsAct(data));
};

export const addPublicMessage =
  (channelId: string, data: PublicMessage[]) => (dispatch: Dispatch) => {
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

export const addPublicMessagesAct = (
  channelId: string,
  data: PublicMessage[]
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

export const addChannelsAct = (data: Channel[]): AddChannelsAction => {
  return {
    type: ActionTypes.CHANNELS,
    data
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
