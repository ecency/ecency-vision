import {
  Channel,
  ChannelUpdate,
  DirectMessage,
  MessagesObject,
  Profile,
  PublicMessage
} from "../../features/chats/managers/message-manager-types";

export interface DirectContactsType {
  name: string;
  pubkey: string;
}

export interface directMessagesList {
  peer: string;
  chat: { [messageId: string]: DirectMessage };
}

export interface publicMessagesList {
  channelId: string;
  PublicMessage: { [messageId: string]: PublicMessage };
}

export interface Chat {
  profiles: Profile[];
  leftChannelsList: string[];
  updatedChannel: ChannelUpdate[];
}

export enum ActionTypes {
  RESET = "@chat/RESET",
  PUBLICMESSAGES = "@chat/PUBLICMESSAGES",
  PROFILES = "@chat/PROFILES",
  LEFTCHANNELLIST = "@chat/LEFTCHANNELLIST",
  UPDATEDCHANNEL = "@chat/UPDATEDCHANNEL",
  REPLACEPUBLICMESSAGE = "@chat/REPLACEPUBLICMESSAGE",
  VERIFYPUBLICMESSAGESENDING = "@chat/VERIFYMESSAGESENDING",
  REPLACEDIRECTMESSAGE = "@chat/REPLACEDIRECTMESSAGE",
  VERIFYDIRECTMESSAGESENDING = "@chat/VERIFYDIRECTMESSAGESENDING",
  DELETEPUBLICMESSAGE = "@chat/DELETEPUBLICMESSAGE",
  DELETEDIRECTMESSAGE = "@chat/DELETEDIRECTMESSAGE",
  ADDPREVIOUSPUBLICMESSAGES = "@chat/ADDPREVIOUSPUBLICMESSAGES"
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
  data: DirectMessage;
  peer: string;
}

export interface PublicMessagesAction {
  type: ActionTypes.PUBLICMESSAGES;
  data: PublicMessage;
  channelId: string;
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
  data: PublicMessage;
  channelId: string;
}

export interface ReplaceDirectMessagesAction {
  type: ActionTypes.REPLACEDIRECTMESSAGE;
  data: DirectMessage;
  peer: string;
}

export interface VerifyPublicMessageSendingAction {
  type: ActionTypes.VERIFYPUBLICMESSAGESENDING;
  data: PublicMessage;
  channelId: string;
}

export interface VerifyDirectMessageSendingAction {
  type: ActionTypes.VERIFYDIRECTMESSAGESENDING;
  data: DirectMessage;
  peer: string;
}

export interface DeletePublicMessagesAction {
  type: ActionTypes.DELETEPUBLICMESSAGE;
  msgId: string;
  channelId: string;
}

export interface DeleteDirectMessagesAction {
  type: ActionTypes.DELETEDIRECTMESSAGE;
  msgId: string;
  peer: string;
}

export interface AddPreviousPublicMessagesAction {
  type: ActionTypes.ADDPREVIOUSPUBLICMESSAGES;
  channelId: string;
  data: MessagesObject;
}

export type Actions =
  | DirectContactsAction
  | DirectMessagesAction
  | ResetChatAction
  | PublicMessagesAction
  | ProfilesAction
  | LeftChannelsAction
  | UpdateChannelAction
  | ReplacePublicMessagesAction
  | VerifyPublicMessageSendingAction
  | ReplaceDirectMessagesAction
  | VerifyDirectMessageSendingAction
  | DeletePublicMessagesAction
  | DeleteDirectMessagesAction
  | AddPreviousPublicMessagesAction;
