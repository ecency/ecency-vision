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

export const getPostsRanked = (
    sort: string, start_author: string = '', start_permlink: string = '',
    limit: number = 20, tag: string = '', observer: string = ''): Promise<Entry[]> =>
    axios
        .post(pickAServer(), {
            jsonrpc: '2.0',
            method: 'bridge.get_ranked_posts',
            params: {sort, start_author, start_permlink, limit, tag, observer},
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

export const getCommunity = (name: string): Promise<Community | undefined> => {
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

            return undefined;
        })
};


export const getCommunities = (
    last: string = '', limit: number = 100,
    query: string = '', sort: string = 'rank',
    observer: string = ''): Promise<Community[] | undefined> => {
    return axios
        .post(pickAServer(), {
            jsonrpc: '2.0',
            method: 'bridge.list_communities',
            params: {last, limit, query, sort, observer},
            id: 1
        }).then(resp => {
            if (resp.data.result) {
                return resp.data.result;
            }

            return undefined;
        })
};
