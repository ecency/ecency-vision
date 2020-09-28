import {LoginAction, LogoutAction} from "../active-user/types";

export enum ActionTypes {
    SET = "@signing-key/SET",
}

export interface SetAction {
    type: ActionTypes.SET;
    key: string;
}

export type Actions = SetAction | LoginAction | LogoutAction;
