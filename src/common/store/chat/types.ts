import {
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
  updatedChannel: ChannelUpdate[];
}

export enum ActionTypes {
  RESET = "@chat/RESET",
  PROFILES = "@chat/PROFILES",
  UPDATEDCHANNEL = "@chat/UPDATEDCHANNEL",
  REPLACEPUBLICMESSAGE = "@chat/REPLACEPUBLICMESSAGE",
  VERIFYPUBLICMESSAGESENDING = "@chat/VERIFYMESSAGESENDING",
  REPLACEDIRECTMESSAGE = "@chat/REPLACEDIRECTMESSAGE",
  VERIFYDIRECTMESSAGESENDING = "@chat/VERIFYDIRECTMESSAGESENDING",
  DELETEPUBLICMESSAGE = "@chat/DELETEPUBLICMESSAGE",
  DELETEDIRECTMESSAGE = "@chat/DELETEDIRECTMESSAGE",
  ADDPREVIOUSPUBLICMESSAGES = "@chat/ADDPREVIOUSPUBLICMESSAGES"
}

export interface ResetChatAction {
  type: ActionTypes.RESET;
}

export interface ProfilesAction {
  type: ActionTypes.PROFILES;
  data: Profile[];
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
  | ResetChatAction
  | ProfilesAction
  | UpdateChannelAction
  | ReplacePublicMessagesAction
  | VerifyPublicMessageSendingAction
  | ReplaceDirectMessagesAction
  | VerifyDirectMessageSendingAction
  | DeletePublicMessagesAction
  | DeleteDirectMessagesAction
  | AddPreviousPublicMessagesAction;
