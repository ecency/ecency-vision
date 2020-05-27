export interface Community {
    about: string,
    avatar_url: string,
    created_at: string,
    description: string,
    flag_text: string,
    id: number,
    is_nsfw: boolean,
    lang: string,
    name: string,
    num_authors: number,
    num_pending: number,
    subscribers: number,
    sum_pending: number,
    team: Array<Array<string>>,
    title: string,
    type_id: number
}

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
