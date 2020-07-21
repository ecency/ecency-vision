export type Subscription = Array<string>;

export enum ActionTypes {
    UPDATE = "@subscriptions/UPDATE",
}

export interface UpdateAct {
    type: ActionTypes.UPDATE;
    list: Subscription[]
}

export type Actions = UpdateAct;
