import moment from "moment";

import {Account} from "../store/accounts/types";
import {Entry} from "../store/entries/types";

import {version} from "../../../package.json";

export interface TempEntryProps {
    author: Account,
    permlink: string,
    parentAuthor: string,
    parentPermlink: string,
    title: string,
    body: string,
    tags: string[],
    category: string,
}

export default (p: TempEntryProps): Entry => {
    const now = moment(Date.now());
    const payout = moment(Date.now()).add(7, 'days');

    return {
        active_votes: [],
        author: p.author.name,
        author_payout_value: "0.000 HBD",
        author_reputation: p.author.reputation as number,
        beneficiaries: [{"account": "ecency", "weight": 100}],
        blacklists: [],
        body: p.body,
        category: p.category,
        children: 0,
        created: now.toISOString(),
        curator_payout_value: "0.000 HBD",
        depth: 0,
        is_paidout: false,
        json_metadata: {app: `ecency/${version}-vision`, format: "markdown+html", tags: p.tags},
        max_accepted_payout: "1000000.000 HBD",
        net_rshares: 0,
        payout: 0,
        payout_at: payout.toISOString(),
        pending_payout_value: "0.000 HBD",
        percent_steem_dollars: 10000,
        permlink: p.permlink,
        post_id: 1,
        promoted: "0.000 HBD",
        replies: [],
        stats: {flag_weight: 0, gray: false, hide: false, total_votes: 0},
        title: p.title,
        updated: now.toISOString(),
        url: `/${p.category}/@${p.author.name}/${p.permlink}`
    }
}
