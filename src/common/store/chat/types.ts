import {
  Channel,
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
}

export enum ActionTypes {
  DIRECTCONTACTS = "@chat/DIRECTCONTACTS",
  DIRECTMESSAGES = "@chat/DIRECTMESSAGES",
  RESET = "@chat/RESET",
  CHANNELS = "@chat/CHANNELS",
  PUBLICMESSAGES = "@chat/PUBLICMESSAGES",
  PROFILES = "@chat/PROFILES"
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

export interface ChannelsAction {
  type: ActionTypes.CHANNELS;
  data: Channel[];
}

export interface ProfilesAction {
  type: ActionTypes.PROFILES;
  data: Profile[];
}

export type Actions =
  | DirectContactsAction
  | DirectMessagesAction
  | ResetChatAction
  | ChannelsAction
  | PublicMessagesAction
  | ProfilesAction;
