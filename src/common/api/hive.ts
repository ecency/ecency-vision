import axios from 'axios';
import {Client, ExtendedAccount} from '@esteemapp/dhive';

import {Entry} from '../store/entries/types';
import {Community} from '../store/communities/types';
import {TrendingTag} from '../store/trending-tags/types';

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

/*
export const setAddress = (address: string) => {
    client = new Client(address);
};

export const getDiscussions = (what: DiscussionQueryCategory, query: DisqussionQuery): Promise<Discussion[]> =>
    client.database.getDiscussions(what, query);
*/

export const getAccount = (username: string): Promise<ExtendedAccount> =>
    client.database.getAccounts([username]).then(resp => resp[0]);

export const getContent = (username: string, permlink: string): Promise<Entry> =>
    client.call('condenser_api', 'get_content', [username, permlink]);

export const getPostsRanked = (sort: string, tag: string = '', observer: string = ''): Promise<Entry[]> =>
    axios
        .post(pickAServer(), {
            jsonrpc: '2.0',
            method: 'bridge.get_ranked_posts',
            params: {sort, tag, observer},
            id: 1
        }).then(resp => {
        if (resp.data.result) {
            return resp.data.result;
        }

        return null;
    });


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


export const getCommunities = (): Promise<Community[] | null> => {
    return axios
        .post(pickAServer(), {
            jsonrpc: '2.0',
            method: 'bridge.list_communities',
            params: {sort: 'rank'},
            id: 1
        }).then(resp => {
            if (resp.data.result) {
                return resp.data.result;
            }

            return null;
        })
};
