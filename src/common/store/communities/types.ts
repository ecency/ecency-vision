import {Community} from '../../api/hive';

export interface State {
    list: Record<string, Community>,
}

export enum ActionTypes {
    FETCHED = '@communities/FETCHED',
}


export interface FetchedAction {
    type: ActionTypes.FETCHED;
    name: string,
    data: Community
}

export type Actions = FetchedAction; // | .. | ..
