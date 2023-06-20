import { DirectMessage } from "./../../../providers/message-provider-types";

export interface DirectContactsType {
  name: string;
  creator: string;
}

export interface Chat {
  directContacts: DirectContactsType[];
  directMessages: DirectMessage[];
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
}

export type Actions = DirectContactsAction | DirectMessagesAction | ResetChatAction;
