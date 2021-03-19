import {Client, RCAPI, utils} from "@hiveio/dhive";

import {RCAccount} from "@hiveio/dhive/lib/chain/rc";

import {TrendingTag} from "../store/trending-tags/types";
import {DynamicProps} from "../store/dynamic-props/types";
import {FullAccount, AccountProfile, AccountFollowStats} from "../store/accounts/types";

import parseAsset from "../helper/parse-asset";
import {vestsToRshares} from "../helper/vesting";
import isCommunity from "../helper/is-community";

import SERVERS from "../constants/servers.json";

export const client = new Client(SERVERS, {
    timeout: 4000,
    failoverThreshold: 10,
    consoleOnFailover: true,
});

export interface Vote {
    percent: number;
    reputation: number;
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

export const getTrendingTags = (afterTag: string = "", limit: number = 250): Promise<string[]> =>
    client.database
        .call("get_trending_tags", [afterTag, limit])
        .then((tags: TrendingTag[]) => {
                return tags
                    .filter((x) => x.name !== "")
                    .filter((x) => !isCommunity(x.name))
                    .map((x) => x.name)
            }
        );

export const lookupAccounts = (q: string, limit = 50): Promise<string[]> =>
    client.database.call("lookup_accounts", [q, limit]);

export const getAccounts = (usernames: string[]): Promise<FullAccount[]> => {
    return client.database.getAccounts(usernames).then((resp: any[]): FullAccount[] =>
        resp.map((x) => {
            const account: FullAccount = {
                name: x.name,
                owner: x.owner,
                active: x.active,
                posting: x.posting,
                memo_key: x.memo_key,
                post_count: x.post_count,
                created: x.created,
                reputation: x.reputation,
                posting_json_metadata: x.posting_json_metadata,
                last_vote_time: x.last_vote_time,
                last_post: x.last_post,
                json_metadata: x.json_metadata,
                reward_hive_balance: x.reward_hive_balance,
                reward_hbd_balance: x.reward_hbd_balance,
                reward_vesting_hive: x.reward_vesting_hive,
                reward_vesting_balance: x.reward_vesting_balance,
                balance: x.balance,
                hbd_balance: x.hbd_balance,
                savings_balance: x.savings_balance,
                savings_hbd_balance: x.savings_hbd_balance,
                next_vesting_withdrawal: x.next_vesting_withdrawal,
                vesting_shares: x.vesting_shares,
                delegated_vesting_shares: x.delegated_vesting_shares,
                received_vesting_shares: x.received_vesting_shares,
                vesting_withdraw_rate: x.vesting_withdraw_rate,
                to_withdraw: x.to_withdraw,
                withdrawn: x.withdrawn,
                witness_votes: x.witness_votes,
                proxy: x.proxy,
                proxied_vsf_votes: x.proxied_vsf_votes,
                voting_manabar: x.voting_manabar,
                voting_power: x.voting_power,
                downvote_manabar: x.downvote_manabar,
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

export const getAccount = (username: string): Promise<FullAccount> => getAccounts([username]).then((resp) => resp[0]);

export const getAccountFull = (username: string): Promise<FullAccount> =>
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

export const findRcAccounts = (username: string): Promise<RCAccount[]> =>
    new RCAPI(client).findRCAccounts([username])

export const getDynamicGlobalProperties = (): Promise<DynamicGlobalProperties> =>
    client.database.getDynamicGlobalProperties().then((r: any) => ({
        total_vesting_fund_hive: r.total_vesting_fund_hive || r.total_vesting_fund_steem,
        total_vesting_shares: r.total_vesting_shares,
        hbd_print_rate: r.hbd_print_rate || r.sbd_print_rate,
    }));

export const getAccountHistory = (username: string, operations: number[]): Promise<any> => {
    const filters = utils.makeBitMaskFilter(operations);
    return client.call("condenser_api", "get_account_history", [username, -1, 500, ...filters]);
}

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

export interface Witness {
    total_missed: number;
    url: string;
    props: {
        account_creation_fee: string;
        account_subsidy_budget: number;
        maximum_block_size: number;
    },
    hbd_exchange_rate: {
        base: string;
    },
    available_witness_account_subsidies: number;
    running_version: string;
    owner: string;
}

export const getWitnessesByVote = (
    from: string = "",
    limit: number = 50
): Promise<Witness[]> => client.call("condenser_api", "get_witnesses_by_vote", [from, limit]);


export interface Proposal {
    creator: string;
    daily_pay: {
        amount: string
        nai: string
        precision: number
    };
    end_date: string;
    id: number;
    permlink: string;
    proposal_id: number;
    receiver: string;
    start_date: string;
    status: string;
    subject: string;
    total_votes: string;
}

export const getProposals = (): Promise<Proposal[]> => client.call("database_api", "list_proposals", {
    start: [-1],
    limit: 200,
    order: 'by_total_votes',
    order_direction: 'descending',
    status: 'all'
}).then(r => r.proposals);

export interface ProposalVote {
    id: number;
    proposal: Proposal;
    voter: string;
}

export const getProposalVotes = (proposalId: number, voter: string = "", limit: number = 300): Promise<ProposalVote[]> =>
    client.call('condenser_api', 'list_proposal_votes', [
        [proposalId, voter],
        limit,
        'by_proposal_voter'
    ])
        .then(r => r.filter((x: ProposalVote) => x.proposal.proposal_id === proposalId))
        .then(r => r.map((x: ProposalVote) => ({id: x.id, voter: x.voter})))


export interface WithdrawRoute {
    auto_vest: boolean;
    from_account: string;
    id: number;
    percent: number;
    to_account: string;
}

export const getWithdrawRoutes = (account: string): Promise<WithdrawRoute[]> =>
    client.database.call("get_withdraw_routes", [account, "outgoing"]);

export const votingPower = (account: FullAccount): number => {
    // @ts-ignore "Account" is compatible with dhive's "ExtendedAccount"
    const calc = client.rc.calculateVPMana(account);
    const {percentage} = calc;

    return percentage / 100;
};

export const powerRechargeTime = (power: number) => {
    const missingPower = 100 - power
    return missingPower * 100 * 432000 / 10000;
}

export const votingValue = (account: FullAccount, dynamicProps: DynamicProps, votingPower: number, weight: number = 10000): number => {
    const {fundRecentClaims, fundRewardBalance, base, quote} = dynamicProps;

    const total_vests =
        parseAsset(account.vesting_shares).amount +
        parseAsset(account.received_vesting_shares).amount -
        parseAsset(account.delegated_vesting_shares).amount;

    const rShares = vestsToRshares(total_vests, votingPower, weight);

    return rShares / fundRecentClaims * fundRewardBalance * (base / quote);
}

export const downVotingPower = (account: FullAccount): number => {
    const curMana = Number(account.voting_manabar.current_mana);
    const curDownMana = Number(account.downvote_manabar.current_mana);
    const downManaLastUpdate = account.downvote_manabar.last_update_time;

    const downVotePerc = curDownMana / (curMana / (account.voting_power / 100) / 4);

    const secondsDiff = (Date.now() - (downManaLastUpdate * 1000)) / 1000;

    const pow = downVotePerc * 100 + (10000 * secondsDiff / 432000);

    const rv = Math.min(pow / 100, 100);

    if (isNaN(rv)) {
        return 0;
    }

    return rv;
};

export const rcPower = (account: RCAccount): number => {
    const calc = client.rc.calculateRCMana(account);
    const {percentage} = calc;
    return percentage / 100;
};

export interface ConversionRequest {
    amount: string;
    conversion_date: string;
    id: number;
    owner: string;
    requestid: number;
}

export const getConversionRequests = (account: string): Promise<ConversionRequest[]> =>
    client.database.call("get_conversion_requests", [account]);
