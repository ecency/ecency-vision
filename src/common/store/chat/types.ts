import { DirectMessage } from "./../../../providers/message-provider-types";

export interface DirectContactsType {
  name: string;
  pubkey: string;
}

export interface directMessagesList {
  peer: string;
  chat: DirectMessage[];
}

export interface Chat {
  directContacts: DirectContactsType[];
  directMessages: directMessagesList[];
}

export enum ActionTypes {
  DIRECTCONTACTS = "@chat/DIRECTCONTACTS",
  DIRECTMESSAGES = "@chat/DIRECTMESSAGES",
  RESET = "@chat/RESET"
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

export type Actions = DirectContactsAction | DirectMessagesAction | ResetChatAction;
