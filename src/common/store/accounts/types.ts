import {ExtendedAccount} from '@esteemapp/dhive';

export interface Account extends ExtendedAccount{}

export type State = Account[];

export enum ActionTypes {
  ADD = "@accounts/ADD",
}

export interface AddAction {
  type: ActionTypes.ADD;
  data: Account;
}

export type Actions = AddAction; // | .. | ..
