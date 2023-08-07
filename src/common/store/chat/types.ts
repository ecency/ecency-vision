import {
  Channel,
  ChannelUpdate,
  DirectMessage,
  Profile,
  PublicMessage
} from "./../../../providers/message-provider-types";

export interface DirectContactsType {
  name: string;
  pubkey: string;
}

export interface directMessagesList {
  peer: string;
  chat: DirectMessage[];
}

export interface publicMessagesList {
  channelId: string;
  PublicMessage: PublicMessage[];
}

export interface Chat {
  directContacts: DirectContactsType[];
  directMessages: directMessagesList[];
  channels: Channel[];
  publicMessages: publicMessagesList[];
  profiles: Profile[];
  leftChannelsList: string[];
  updatedChannel: ChannelUpdate[];
}

export enum ActionTypes {
  DIRECTCONTACTS = "@chat/DIRECTCONTACTS",
  DIRECTMESSAGES = "@chat/DIRECTMESSAGES",
  RESET = "@chat/RESET",
  CHANNELS = "@chat/CHANNELS",
  PUBLICMESSAGES = "@chat/PUBLICMESSAGES",
  PROFILES = "@chat/PROFILES",
  LEFTCHANNELLIST = "@chat/LEFTCHANNELLIST",
  UPDATEDCHANNEL = "@chat/UPDATEDCHANNEL",
  REPLACEPUBLICMESSAGE = "@chat/REPLACEPUBLICMESSAGE",
  VERIFYMESSAGESENDING = "@chat/VERIFYMESSAGESENDING"
}

export interface DirectContactsAction {
  type: ActionTypes.DIRECTCONTACTS;
  data: DirectContactsType[];
}

export interface ResetChatAction {
  type: ActionTypes.RESET;
}

export interface DirectMessagesAction {
  type: ActionTypes.DIRECTMESSAGES;
  data: DirectMessage[];
  peer: string;
}

export interface PublicMessagesAction {
  type: ActionTypes.PUBLICMESSAGES;
  data: PublicMessage[];
  channelId: string;
}

export interface AddChannelsAction {
  type: ActionTypes.CHANNELS;
  data: Channel[];
}

export interface ProfilesAction {
  type: ActionTypes.PROFILES;
  data: Profile[];
}
export interface LeftChannelsAction {
  type: ActionTypes.LEFTCHANNELLIST;
  data: string[];
}

export interface UpdateChannelAction {
  type: ActionTypes.UPDATEDCHANNEL;
  data: ChannelUpdate[];
}

export interface ReplacePublicMessagesAction {
  type: ActionTypes.REPLACEPUBLICMESSAGE;
  data: PublicMessage[];
  channelId: string;
}

export interface VerifySendingMessageAction {
  type: ActionTypes.VERIFYMESSAGESENDING;
  data: PublicMessage[];
  channelId: string;
}

export type Actions =
  | DirectContactsAction
  | DirectMessagesAction
  | ResetChatAction
  | AddChannelsAction
  | PublicMessagesAction
  | ProfilesAction
  | LeftChannelsAction
  | UpdateChannelAction
  | ReplacePublicMessagesAction
  | VerifySendingMessageAction;
