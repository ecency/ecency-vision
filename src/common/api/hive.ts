import {Client} from "@hiveio/dhive";

import {TrendingTag} from "../store/trending-tags/types";
import {DynamicProps} from "../store/dynamic-props/types";
import {Account, AccountProfile, AccountFollowStats} from "../store/accounts/types";

import parseAsset from "../helper/parse-asset";

import SERVERS from "../constants/servers.json";

export const client = new Client(SERVERS, {
    timeout: 3000,
    rebrandedApi: true,
});

export interface Vote {
    percent: number;
    rshares: string;
    time: string;
    timestamp?: number;
    voter: string;
    weight: number;
    reward?: number;
}

export interface DynamicGlobalProperties {
    hbd_print_rate: number;
    total_vesting_fund_hive: string;
    total_vesting_shares: string;
}

export interface FeedHistory {
    current_median_history: {
        base: string;
        quote: string;
    };
}

export interface RewardFund {
    recent_claims: string;
    reward_balance: string;
}

export interface DelegatedVestingShare {
    id: number;
    delegatee: string;
    delegator: string;
    min_delegation_time: string;
    vesting_shares: string;
}

export interface Follow {
    follower: string;
    following: string;
    what: string[];
}

export const getPost = (username: string, permlink: string): Promise<any> =>
    client.call("condenser_api", "get_content", [username, permlink]);

export const getActiveVotes = (author: string, permlink: string): Promise<Vote[]> =>
    client.database.call("get_active_votes", [author, permlink]);

const shuffle = (array: any[]) => {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

export const getTrendingTags = (afterTag: string = "", limit: number = 250): Promise<string[]> =>
    client.database
        .call("get_trending_tags", [afterTag, limit])
        .then((t: TrendingTag[]) => {
                const st = shuffle(t);
                return st.filter((x) => x.name !== "").map((x) => x.name)
            }
        );

export const lookupAccounts = (q: string, limit = 50): Promise<string[]> =>
    client.database.call("lookup_accounts", [q, limit]);

export const getAccounts = (usernames: string[]): Promise<Account[]> => {
    return client.database.getAccounts(usernames).then((resp: any[]): Account[] =>
        resp.map((x) => {
            const account: Account = {
                name: x.name,
                active: x.active,
                posting: x.posting,
                memo_key: x.memo_key,
                post_count: x.post_count,
                created: x.created,
                reputation: x.reputation,
                posting_json_metadata: x.posting_json_metadata,
                json_metadata: x.json_metadata,
                reward_steem_balance: x.reward_steem_balance || x.reward_hive_balance,
                reward_sbd_balance: x.reward_sbd_balance || x.reward_hbd_balance,
                reward_vesting_steem: x.reward_vesting_steem || x.reward_vesting_hive,
                reward_vesting_balance: x.reward_vesting_balance,
                balance: x.balance,
                sbd_balance: x.sbd_balance || x.hbd_balance,
                savings_balance: x.savings_balance,
                savings_sbd_balance: x.savings_sbd_balance || x.savings_hbd_balance,
                next_vesting_withdrawal: x.next_vesting_withdrawal,
                vesting_shares: x.vesting_shares,
                delegated_vesting_shares: x.delegated_vesting_shares,
                received_vesting_shares: x.received_vesting_shares,
                vesting_withdraw_rate: x.vesting_withdraw_rate,
                to_withdraw: x.to_withdraw,
                withdrawn: x.withdrawn,
                voting_manabar: x.voting_manabar,
                __loaded: true,
            };

            let profile: AccountProfile | undefined;

            try {
                profile = JSON.parse(x.posting_json_metadata!).profile;
            } catch (e) {
            }

            if (!profile) {
                try {
                    profile = JSON.parse(x.json_metadata!).profile;
                } catch (e) {
                }
            }

            if (!profile) {
                profile = {
                    about: '',
                    cover_image: '',
                    location: '',
                    name: '',
                    profile_image: '',
                    website: '',
                }
            }

            return {...account, profile};
        })
    );
};

export const getAccount = (username: string): Promise<Account> => getAccounts([username]).then((resp) => resp[0]);

export const getAccountFull = (username: string): Promise<Account> =>
    getAccount(username).then(async (account) => {
        let follow_stats: AccountFollowStats | undefined;
        try {
            follow_stats = await getFollowCount(username);
        } catch (e) {
        }

        return {...account, follow_stats};
    });

export const getFollowCount = (username: string): Promise<AccountFollowStats> =>
    client.database.call("get_follow_count", [username]);

export const getFollowing = (
    follower: string,
    startFollowing: string,
    followType = "blog",
    limit = 100
): Promise<Follow[]> => client.database.call("get_following", [follower, startFollowing, followType, limit]);

export const getFollowers = (
    following: string,
    startFollowing: string,
    followType = "blog",
    limit = 100
): Promise<Follow[]> => client.database.call("get_followers", [following, startFollowing, followType, limit]);

export const getDynamicGlobalProperties = (): Promise<DynamicGlobalProperties> =>
    client.database.getDynamicGlobalProperties().then((r: any) => ({
        total_vesting_fund_hive: r.total_vesting_fund_hive || r.total_vesting_fund_steem,
        total_vesting_shares: r.total_vesting_shares,
        hbd_print_rate: r.hbd_print_rate || r.sbd_print_rate,
    }));

export const getState = (path: string): Promise<any> => client.database.getState(path);

export const getFeedHistory = (): Promise<FeedHistory> => client.database.call("get_feed_history");

export const getRewardFund = (): Promise<RewardFund> => client.database.call("get_reward_fund", ["post"]);

export const getDynamicProps = async (): Promise<DynamicProps> => {
    const globalDynamic = await getDynamicGlobalProperties();
    const feedHistory = await getFeedHistory();
    const rewardFund = await getRewardFund();

    const hivePerMVests =
        (parseAsset(globalDynamic.total_vesting_fund_hive).amount / parseAsset(globalDynamic.total_vesting_shares).amount) *
        1e6;
    const base = parseAsset(feedHistory.current_median_history.base).amount;
    const quote = parseAsset(feedHistory.current_median_history.quote).amount;
    const fundRecentClaims = parseFloat(rewardFund.recent_claims);
    const fundRewardBalance = parseAsset(rewardFund.reward_balance).amount;
    const hbdPrintRate = globalDynamic.hbd_print_rate;
    return {hivePerMVests, base, quote, fundRecentClaims, fundRewardBalance, hbdPrintRate};
};

export const getVestingDelegations = (
    username: string,
    from: string = "",
    limit: number = 50
): Promise<DelegatedVestingShare[]> => client.database.call("get_vesting_delegations", [username, from, limit]);

export const vpMana = (account: Account): number => {
    // @ts-ignore "Account" is compatible with dhive's "ExtendedAccount"
    const calc = client.rc.calculateVPMana(account);
    const {percentage} = calc;
    return percentage / 100;
};
