import {ExtendedAccount} from '@esteemapp/dhive';

export interface Profile extends ExtendedAccount{}

export type State = Profile[];

export enum ActionTypes {
  ADD = "@profiles/ADD",
}

export interface AddAction {
  type: ActionTypes.ADD;
  data: Profile;
}

export type Actions = AddAction; // | .. | ..
