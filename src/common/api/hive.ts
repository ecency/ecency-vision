import axios from 'axios';
import {Client, DiscussionQueryCategory, DisqussionQuery, Discussion} from '@esteemapp/dhive';


export interface TrendingTag {
    comments: number,
    name: string,
    top_posts: number,
    total_payouts: string
}

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

const DEFAULT_SERVERS = [
    'https://anyx.io',
    'https://rpc.esteem.app',
    'https://api.hive.blog',
    'https://api.hivekings.com',
];

let client = new Client(DEFAULT_SERVERS, {
    timeout: 3000
});

const pickAServer = (): string => DEFAULT_SERVERS.sort(() => 0.5 - Math.random())[0];

export const setAddress = (address: string) => {
    client = new Client(address);
};

export const getDiscussions = (what: DiscussionQueryCategory, query: DisqussionQuery): Promise<Discussion[]> =>
    client.database.getDiscussions(what, query);


export const getTrendingTags = (afterTag: string = '', limit: number = 50): Promise<string[]> =>
    client.database.call('get_trending_tags', [afterTag, limit])
        .then((t: TrendingTag[]) => t.filter(x => x.name !== '').map(x => x.name));

export const getCommunity = (name: string): Promise<Community | null> => {
    return axios
        .post(pickAServer(), {
            jsonrpc: '2.0',
            method: 'bridge.get_community',
            params: {name, observer: ''},
            id: 1
        }).then(resp => {
            if (resp.data.result) {
                return resp.data.result;
            }

            return null;
        })
};
