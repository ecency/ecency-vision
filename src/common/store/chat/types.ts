import { DirectMessage } from "./../../../providers/message-provider-types";
import { Account } from "../accounts/types";

export interface DirectContactsType {
  name: string;
  creator: string;
}

export interface Chat {
  directContacts: DirectContactsType[];
  directMessages: DirectMessage[];
  // points: UserPoints;
}

export enum ActionTypes {
  DIRECTCONTACTS = "@chat/DIRECTCONTACTS",
  DIRECTMESSAGES = "@chat/DIRECTMESSAGES"
  // LOGOUT = "@active-user/LOGOUT",
  // UPDATE = "@active-user/UPDATE"
}

export interface DirectContactsAction {
  type: ActionTypes.DIRECTCONTACTS;
  data: DirectContactsType[];
}

export interface DirectMessagesAction {
  type: ActionTypes.DIRECTMESSAGES;
  data: DirectMessage[];
}
// export interface LogoutAction {
//   type: ActionTypes.LOGOUT;
// }

// export interface UpdateAction {
//   type: ActionTypes.UPDATE;
//   data: Account;
//   points: UserPoints;
// }

export type Actions = DirectContactsAction | DirectMessagesAction;
