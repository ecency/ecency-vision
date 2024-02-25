import {Global, EntryFilter, Theme, ListStyle} from "../store/global/types";
import {TrendingTags} from "../store/trending-tags/types";
import {Entry} from "../store/entries/types";
import {Community} from "../store/communities/types";
import {Reblogs} from "../store/reblogs/types";
import {DynamicProps} from "../store/dynamic-props/types";
import {UI} from "../store/ui/types";
import {PointTransaction} from "../store/points/types";
import {Vote, DelegatedVestingShare, Proposal, SavingsWithdrawRequest, ConversionRequest, OpenOrdersData} from "../api/hive";
import {ReceivedVestingShare} from "../api/private-api";
import {
    ApiFollowNotification,
    ApiMentionNotification,
    ApiNotification,
    ApiReblogNotification,
    ApiReplyNotification, ApiTransferNotification,
    ApiVoteNotification,
    Notifications
} from "../store/notifications/types";
import {ActiveUser} from "../store/active-user/types";
import {FullAccount} from "../store/accounts/types";
import {SearchResponse, AccountSearchResult} from "../api/search-api";
import { AssetSymbol } from '@hiveio/dhive';
import ConversionRequests from '../components/converts';

export const allOver = () => new Promise((resolve) => setImmediate(resolve));

export const activeUserMaker = (name: string): ActiveUser => {
    return {
        username: name,
        data: {
            name: name
        },
        points: {
            points: "1.000",
            uPoints: "0.500"
        }
    }
}

export const fullAccountInstance: FullAccount = {
    "name": "talhasch",
    "owner": {"weight_threshold": 1, "account_auths": [], "key_auths": [["STM7F7zfd6ieangxz6uxQkYifUS5H841x5E41SYZaVc9F9cGPJ9jN", 1]]},
    "active": {"weight_threshold": 1, "account_auths": [], "key_auths": [["STM71z4rmzGHdp7pmePZyS1G2GrbuBqg9PPHRgiK6uYqjzUTRNCRR", 1]]},
    "posting": {
        "weight_threshold": 1,
        "account_auths": [["ecency.app", 1], ["esteem-app", 1], ["esteem.app", 1], ["esteemapp", 1], ["peakd.app", 1]],
        "key_auths": [["STM6uvU7j624wCZNa2pcXvkqmbnNC1cgraDrVG3pFRhXvj9LYS7Xp", 1]]
    },
    "memo_key": "STM7rioGL7NopT2Zo446hnzAiHLp5sJ1gS55xu3NikmxfQnEznsue",
    "post_count": 261,
    "created": "2018-01-29T20:10:06",
    "reputation": "1021265023022",
    "posting_json_metadata": "{\"profile\":{\"name\":\"Talha B.\",\"about\":\"Founder @runkod, Software Developer @ecency, Lifelong Learner\",\"cover_image\":\"https://images.ecency.com/DQmTsFJJV7gXpsHNatEWz1vgzykaM4WByxAgLMzWshmXNrj/cover.jpg\",\"profile_image\":\"https://images.ecency.com/DQmV2J1oAUoKxjyJQTu3TcZfGxDr5fzajMGhHEd1e1GALca/ben.jpg\",\"website\":\"https://github.com/talhasch\",\"location\":\"Istanbul\",\"version\":2}}",
    "json_metadata": "{\"profile\":{\"name\":\"Talha B.\",\"about\":\"Founder @runkod, Software Developer @esteemapp, Lifelong Learner\",\"cover_image\":\"https://img.esteem.app/rwd380.jpg\",\"profile_image\":\"https://img.esteem.app/821e0q.jpg\",\"website\":\"https://github.com/talhasch\",\"location\":\"Istanbul\"},\"escrow\":{\"fees\":{\"STEEM\":\"1.000\",\"SBD\":\"3.000\"},\"terms\":\"lorem ipsum dolor sit amet\"}}",
    "last_vote_time": "2020-06-01T22:22:22",
    "last_post": "2020-06-01T05:53:33",
    "reward_hive_balance": "0.000 HIVE",
    "reward_hbd_balance": "0.000 HBD",
    "reward_vesting_hive": "0.000 HIVE",
    "reward_vesting_balance": "0.000000 VESTS",
    "balance": "1.751 HIVE",
    "hbd_balance": "0.311 HBD",
    "savings_balance": "1.000 HIVE",
    "savings_hbd_balance": "0.002 HBD",
    "next_vesting_withdrawal": "1969-12-31T23:59:59",
    "vesting_shares": "151590.952150 VESTS",
    "delegated_vesting_shares": "145395.758709 VESTS",
    "received_vesting_shares": "0.000000 VESTS",
    "vesting_withdraw_rate": "0.000000 VESTS",
    "to_withdraw": "87017000000",
    "withdrawn": "87017000000",
    "witness_votes": ["blocktrades", "good-karma", "gtg"],
    "proxy": "",
    "proxied_vsf_votes": [0, 0, 0, 0],
    "voting_manabar": {"current_mana": "6195193441", "last_update_time": 1607690265},
    "downvote_manabar": {current_mana: "36303329010", last_update_time: 1609750587},
    "voting_power": 9476,
    "__loaded": true,
    "profile": {
        "name": "Talha B.",
        "about": "Founder @runkod, Software Developer @ecency, Lifelong Learner",
        "cover_image": "https://images.ecency.com/DQmTsFJJV7gXpsHNatEWz1vgzykaM4WByxAgLMzWshmXNrj/cover.jpg",
        "profile_image": "https://images.ecency.com/DQmV2J1oAUoKxjyJQTu3TcZfGxDr5fzajMGhHEd1e1GALca/ben.jpg",
        "website": "https://github.com/talhasch",
        "location": "Istanbul"
    },
    "follow_stats": {"account": "talhasch", "following_count": 27, "follower_count": 232},
    pending_claimed_accounts: 0
}

export const RcAccountInstance = {
    "account": "foo",
    "rc_manabar": {"current_mana": "11657596161418", "last_update_time": 1615134327},
    "max_rc_creation_adjustment": {"amount": "2020748973", "precision": 6, "nai": "@@000000037"},
    "max_rc": "11657682161151"
}

export const activeUserInstance: ActiveUser = activeUserMaker("foo");

export const UiInstance: UI = {
    login: false,
    loginKc: false,
    notifications: false
}

export const globalInstance: Global = {
  filter: EntryFilter.hot,
  tag: "",
  theme: Theme.day,
  listStyle: ListStyle.row,
  intro: true,
  currency: "usd",
  currencyRate: 1,
  currencySymbol: "$",
  lang: "en-US",
  searchIndexCount: 10000000,
  canUseWebp: false,
  hasKeyChain: false,
  isElectron: false,
  isMobile: false,
  notifications: true,
  nsfw: false,
  newVersion: null,
  usePrivate: true,
  tags: [],
  hive_id: "",
  ctheme: "",
  baseApiUrl: "",
};

export const TrendingTagsInstance: TrendingTags = {
    list: ["foo", "bar", "baz"],
    error: false,
    loading: false,
};

export const entryInstance1: Entry = {
    post_id: 86342505,
    author: "good-karma",
    permlink: "awesome-hive",
    category: "hive",
    title: "Awesome Hive",
    body:
        "Hey developers,\n\n![awesome-hive.png](https://images.ecency.com/DQmetNmv6rtcRxueXJSNm7ErLLKNYGJETxsNSoehn6xk9BC/awesome-hive.png)\n\nI just created [Awesome-Hive](https://github.com/ledgerconnect/awesome-hive), list of services and apps on Hive.\n\nIf you don't know about Awesome project, take a look at here: https://project-awesome.org/\n\nProject contains list of services and links to various tools and libraries. Quite useful if you are developing or learning some new programming languages or skills. So we now have `awesome-hive` list, feel free to submit your pull request to add your apps, services. \n\nI will submit PR to project awesome in 30 days to list Hive in decentralized systems section. One of the requirements, awesome list should be around for more than 30 days. So I ask anyone with service, tools, dapps to submit pull request to https://github.com/ledgerconnect/awesome-hive so we have complete list of services by end of June.\n\nIn 30 days, we will PR to official project awesome list. More awareness about awesome Hive! Meanwhile, let's complete `awesome-hive` together! \ud83d\ude0e \ud83d\ude47 \ud83d\ude4f \n\n## Hive on!",
    json_metadata: {
        tags: ["hive", "hiveio", "awesome", "devs", "development", "list"],
        app: "esteem/2.2.7-surfer",
    },
    created: "2020-06-01T05:53:33",
    updated: "2020-06-01T14:41:15",
    depth: 0,
    children: 31,
    net_rshares: 234863836438976,
    is_paidout: false,
    payout_at: "2020-06-08T05:53:33",
    payout: 125.095,
    pending_payout_value: "125.095 HBD",
    author_payout_value: "0.000 HBD",
    curator_payout_value: "0.000 HBD",
    promoted: "0.000 HBD",
    replies: [],
    active_votes: [
        {
            voter: "user1",
            rshares: 34273117581576,
        },
        {
            voter: "user2",
            rshares: 2269348064337,
        },
        {
            voter: "user3",
            rshares: 19969726098,
        },
        {
            voter: "user4",
            rshares: 725359024516,
        },
        {
            voter: "user5",
            rshares: 24029616493,
        },
        {
            voter: "user6",
            rshares: 1485954337,
        },
        {
            voter: "user7",
            rshares: 1281560607198,
        },
        {
            voter: "user8",
            rshares: 554323413016,
        },
        {
            voter: "user9",
            rshares: 140063022903,
        },
        {
            voter: "user10",
            rshares: 542424211,
        },
    ],
    author_reputation: 76.58,
    stats: {
        hide: false,
        gray: false,
        total_votes: 10,
        flag_weight: 1.0,
    },
    beneficiaries: [
        {
            account: "esteemapp",
            weight: 300,
        },
    ],
    max_accepted_payout: "1000000.000 HBD",
    percent_hbd: 10000,
    url: "/hive/@good-karma/awesome-hive",
    blacklists: [],
};


export const crossEntryInstance: Entry = {
    "post_id": 102577753,
    "author": "regenerette",
    "permlink": "we-need-each-one-of-you-sos-financial-advice-for-hive-newcomers-hive-125125",
    "category": "hive-125125",
    "title": "WE NEED EACH ONE OF YOU - SOS Financial Advice For Hive Newcomers ",
    "body": "This is a cross post of [@regenerette/we-need-each-one-of-you-sos-financial-advice-for-hive-newcomers](/hive-167922/@regenerette/we-need-each-one-of-you-sos-financial-advice-for-hive-newcomers) by @regenerette.<br><br>Newcommers Call = Could You See It?",
    "json_metadata": {
        "app": "peakd/2021.03.7",
        "tags": ["cross-post"],
        "original_author": "regenerette",
        "original_permlink": "we-need-each-one-of-you-sos-financial-advice-for-hive-newcomers"
    },
    "created": "2021-03-24T20:21:45",
    "updated": "2021-03-24T20:21:45",
    "depth": 0,
    "children": 1,
    "net_rshares": 0,
    "is_paidout": false,
    "payout_at": "2021-03-31T20:21:45",
    "payout": 0,
    "pending_payout_value": "0.000 HBD",
    "author_payout_value": "0.000 HBD",
    "curator_payout_value": "0.000 HBD",
    "promoted": "0.000 HBD",
    "replies": [],
    "author_reputation": 56.64,
    "stats": {"hide": false, "gray": false, "total_votes": 0, "flag_weight": 0},
    "url": "/hive-125125/@regenerette/we-need-each-one-of-you-sos-financial-advice-for-hive-newcomers-hive-125125",
    "beneficiaries": [],
    "max_accepted_payout": "0.000 HBD",
    "percent_hbd": 10000,
    "active_votes": [],
    "blacklists": [],
    "community": "hive-125125",
    "community_title": "Ecency",
    "author_role": "guest",
    "author_title": "",
    "original_entry": {
        "post_id": 102573102,
        "author": "regenerette",
        "permlink": "we-need-each-one-of-you-sos-financial-advice-for-hive-newcomers",
        "category": "hive-167922",
        "title": "WE NEED EACH ONE OF YOU - SOS Financial Advice For Hive Newcomers ",
        "body": "Hi\n\nI have decided to write this article for newcomers (that need some guidance), for more experienced ones (that can contribute with input, commenting, and helping with suggestions for this article), and for myself. So, please, keep this in mind, as you read it.\n***If you’re already in Hive and wish to help with an idea, your comment could make you a benefactor for me and for others. So, I am thanking you right from the start for reading and helping us with a suggestion, advice, anything.***\n\n![regenerette_bannerleofinance.png](https://images.ecency.com/DQmSCnuynBe64vowY7Q87JwDJPQN6iaArnCU9vPbsdWzyCw/regenerette_bannerleofinance.png)\n\n\n\nHive eco-system is the source of our crypto funds, a win-win social tool that provides you with great opportunities to reach your goals. ***But do you know how to manage these crypto funds in the most efficient way so that you really achieve more soon? ***\n\n\n![stage_with_hologram3_min.png](https://images.ecency.com/DQmQYZdH6qJQMxSaZYoCSCzSXmRn4qVGJBg6iinHBU1wH2M/stage_with_hologram3_min.png)\n\n\nWouldn’t it be nice if there were a magic formula or simple trick that allowed you never to worry about your daily “hiving around” or manage your crypto finances better?\n \nI’d like to show you a simple Hive mindset for myself, a newbie. I’d love it if others could help me understand more practical ways to enrich my strategy for HIVING AROUND and making more per day. \nHere I have uncovered 5 key approaches to self-financing that help me and might help you improve your crypto skills in Hive:\n\n**1** **Sort it all out and prioritize**:\n\nTake time to think about your final goal, which dream would you like to realize? How you can achieve it, obviously it would require a certain time and healthy use of funds you receive from HIVE.\n\nSet long-term and short-term goals. Think about what you can do today to come closer to the desired result.\n\n\n**2 Define time-bounds**:\n\nBoth long-term and short-term goals should be specific, have a date, be measurable and realistic. Do you have debts? Pay them off to be free of any hurdles on the way towards your financial achievements. Create a sample plan a monthly budget and a spending plan to obtain full control of the situation.\n\nBy the way, you can track all funds that you raise here on your Hive account that is integrated into your personal account. Keep analyzing the money you make weekly, monitor your progress, and see where you are from the final goal.\n\n\n**3 Create an emergency fund**:\n\nIt's no surprise that when life presents an emergency, it threatens your financial well-being and causes stress. If you're living without a safety net, you're living on the \"financial\" edge, hoping to get by without running into a crisis.\n\nBeing prepared with an emergency crypto fund gives you confidence that you can tackle any of life's unexpected events without adding money worries to your list. You can always count on the power of our community, there are so many people ready to help you out, still, it is always better to create \"a safety bag\".\nPeople in Hive now have the option to use https://buymeberries.com/ to donate for others. \n#bmbhome\n\n\n**4 Budget is always important**:\n\nYou can make your budget as detailed as you want, as long as it helps you reach the ultimate Hive goal of spending less than you make, always save for the future. Stake maybe?\n\nA crypto budget will also help you decide how to spend your crypto, and what to invest in over the coming months and years. Without the plan, you might spend liquidity on things that seem important now, but don't offer much in terms of enhancing your future.\n\n\n**5 Seek advice**:\n\nIf you feel a lack of practical skills, if you don't know how to manage Hive tokens, don't be afraid to seek Hive advice. \n\nI am asking HIVE more experienced users to give any advice to new users by commenting on this post. Let us know what to do besides just posting and answering other people's posts. What else can we do to get more tokens, more HP, and more…anything? Contest? Farming? – How does one farm? Delegating and who? What else?\n\n@regenerette\n\n![banner_laleo.png](https://images.ecency.com/DQmXqfSMryc41TJAmD85CSrxrNqKzMntu6EDss8xnMSXQXt/banner_laleo.png)\n\n\nThank you for reading!\n~ I live today for me and for others ~\nWhy not join [JOIN HIVE](https://peakd.com/register?ref=regenerette) and become part of this amazing community!!!?\n\n\n![loepng.png](https://images.ecency.com/DQmdfMBTEXfzHRiVLq53vcPwfa1saXBhKcDKr1eqeg9P2Jr/loepng.png)\n\n![fxx5caie56ynwsjysm2xunozdmysq1yndrbt9x9veernm1981q9qbbm7xzs6mzhztz7px8zewhj4dosulcvjgksndfg731eqtdzgoj35wnxx.gif](https://images.ecency.com/DQmQLVPEJy2gTRgnK73SpAHuQbWguZkoAQLcM5dqhsEKHgr/fxx5caie56ynwsjysm2xunozdmysq1yndrbt9x9veernm1981q9qbbm7xzs6mzhztz7px8zewhj4dosulcvjgksndfg731eqtdzgoj35wnxx.gif)\n\n\n\n\n\n\nPosted Using [LeoFinance <sup>Beta</sup>](https://leofinance.io/@regenerette/we-need-each-one-of-you-sos-financial-advice-for-hive-newcomers)",
        "json_metadata": {
            "app": "leofinance/0.2",
            "format": "markdown",
            "tags": ["leofinance", "ctp", "proofofbrain", "archon", "neoxian", "creativecoin", "palnet", "chary", "bilpcoin", "ocd"],
            "canonical_url": "https://leofinance.io/@regenerette/we-need-each-one-of-you-sos-financial-advice-for-hive-newcomers",
        },
        "created": "2021-03-24T16:14:42",
        "updated": "2021-03-24T16:19:36",
        "depth": 0,
        "children": 10,
        "net_rshares": 8394534391123,
        "is_paidout": false,
        "payout_at": "2021-03-31T16:14:42",
        "payout": 5.946,
        "pending_payout_value": "5.946 HBD",
        "author_payout_value": "0.000 HBD",
        "curator_payout_value": "0.000 HBD",
        "promoted": "0.000 HBD",
        "replies": [],
        "author_reputation": 56.64,
        "stats": {"hide": false, "gray": false, "total_votes": 59, "flag_weight": 0},
        "url": "/hive-167922/@regenerette/we-need-each-one-of-you-sos-financial-advice-for-hive-newcomers",
        "beneficiaries": [],
        "max_accepted_payout": "1000000.000 HBD",
        "percent_hbd": 10000,
        "active_votes": [{"rshares": 308271008130, "voter": "svamiva"}, {"rshares": 882060063768, "voter": "ausbitbank"}, {
            "rshares": 41179914713,
            "voter": "krystle"
        }, {"rshares": 10184621620, "voter": "anarcist69"}, {"rshares": 60754236643, "voter": "scaredycatguide"}, {
            "rshares": 30379382731,
            "voter": "jlufer"
        }, {"rshares": 20624058840, "voter": "clayboyn"}, {"rshares": 59031515005, "voter": "r0nd0n"}, {
            "rshares": 13366123570,
            "voter": "mitchelljaworski"
        }, {"rshares": 3763903058, "voter": "ma1neevent"}, {"rshares": 59192409376, "voter": "amberyooper"}, {
            "rshares": 1119195703381,
            "voter": "followbtcnews"
        }, {"rshares": 770968428854, "voter": "isaria"}, {"rshares": 2448954060270, "voter": "minnowsupport"}, {
            "rshares": 357915457366,
            "voter": "crimsonclad"
        }, {"rshares": 19833307049, "voter": "vachemorte"}, {"rshares": 266458345307, "voter": "juliakponsford"}, {
            "rshares": 2451612319,
            "voter": "auditoryorgasms"
        }, {"rshares": 10510733533, "voter": "st3llar"}, {"rshares": 1096800958, "voter": "koh"}, {"rshares": 7480530904, "voter": "bex-dk"}, {
            "rshares": 24232431632,
            "voter": "dinshatech"
        }, {"rshares": 1328531906, "voter": "digitalpnut"}, {"rshares": 1593592511, "voter": "run-the-bits"}, {
            "rshares": 1464842216323,
            "voter": "msp-curation"
        }, {"rshares": 32218931639, "voter": "aagabriel"}, {"rshares": 23456628498, "voter": "flaxz"}, {"rshares": 872056776, "voter": "alitavirgen"}, {
            "rshares": 697663478,
            "voter": "therabbitzone"
        }, {"rshares": 4734033244, "voter": "franz54"}, {"rshares": 49345291774, "voter": "blarchive"}, {"rshares": 2023866799, "voter": "anarcist"}, {
            "rshares": 26565771,
            "voter": "adumbrate"
        }, {"rshares": 1845176869, "voter": "catarafa"}, {"rshares": 127865883, "voter": "tankadiary"}, {"rshares": 519158925, "voter": "bearableguy123"}, {
            "rshares": 2045810365,
            "voter": "creary"
        }, {"rshares": 5048296448, "voter": "nftshowroom"}, {"rshares": 1146516946, "voter": "peachymod"}, {
            "rshares": 108815286965,
            "voter": "lisamgentile1961"
        }, {"rshares": 6717937187, "voter": "rootdraws"}, {"rshares": 15421562, "voter": "rpi"}, {"rshares": 141605135, "voter": "toni.curation"}, {
            "rshares": 98456195,
            "voter": "faireye"
        }, {"rshares": 910253967, "voter": "julesquirin"}, {"rshares": 846225189, "voter": "almightymelon"}, {
            "rshares": 2027225084,
            "voter": "localgrower"
        }, {"rshares": 109893171681, "voter": "tanjakolader"}, {"rshares": 842827730, "voter": "flaxz.ctp"}, {"rshares": 5766385063, "voter": "leoschein"}, {
            "rshares": 38796762150,
            "voter": "unorgmilitia"
        }, {"rshares": 0, "voter": "regeneretta"}, {"rshares": 1398441903, "voter": "megaleoschein"}, {"rshares": 1707971814, "voter": "dugsix"}, {
            "rshares": 1996427811,
            "voter": "bhealy"
        }, {"rshares": 1364612442, "voter": "generatornation"}, {"rshares": 1740006545, "voter": "darinapogodina"}, {"rshares": 0, "voter": "bbananass"}, {
            "rshares": 1678519518,
            "voter": "maurofolco"
        }],
        "blacklists": [],
        "community": "hive-167922",
        "community_title": "LeoFinance",
        "author_role": "guest",
        "author_title": ""
    }
}

export const votesInstance1: Vote[] = [
    {
        voter: "user1",
        reputation: 566619025187407,
        weight: 40289,
        rshares: "84880616925",
        percent: 40,
        time: "2020-06-14T15:19:51",
    },
    {
        voter: "user2",
        reputation: 606077040417259,
        weight: 0,
        rshares: "39117096",
        percent: 10000,
        time: "2020-06-14T15:15:15",
    },
];

export const delegatedVestingInstance: DelegatedVestingShare[] = [
    {
        id: 1327252,
        delegator: "esteemapp",
        delegatee: "user1",
        vesting_shares: "14848.000000 VESTS",
        min_delegation_time: "2020-02-24T09:53:57",
    },
    {
        id: 1329459,
        delegator: "esteemapp",
        delegatee: "user2",
        vesting_shares: "191778.000000 VESTS",
        min_delegation_time: "2020-03-13T08:34:57",
    },
    {
        id: 1325910,
        delegator: "esteemapp",
        delegatee: "user3",
        vesting_shares: "29326.000000 VESTS",
        min_delegation_time: "2020-02-18T18:32:06",
    },
    {
        id: 1325312,
        delegator: "esteemapp",
        delegatee: "user4",
        vesting_shares: "27751.000000 VESTS",
        min_delegation_time: "2020-02-17T09:28:12",
    },
    {
        id: 1330486,
        delegator: "esteemapp",
        delegatee: "user5",
        vesting_shares: "1957.888055 VESTS",
        min_delegation_time: "2020-03-24T12:42:39",
    },
];

export const receivedVestingInstance: ReceivedVestingShare[] = [
    {
        delegator: "user1",
        delegatee: "esteemapp",
        vesting_shares: "14848.000000 VESTS",
        timestamp: "2020-02-24T09:53:57",
    },
    {
        delegator: "user2",
        delegatee: "esteemapp",
        vesting_shares: "191778.000000 VESTS",
        timestamp: "2020-03-13T08:34:57",
    },
    {
        delegator: "user3",
        delegatee: "esteemapp",
        vesting_shares: "29326.000000 VESTS",
        timestamp: "2020-02-18T18:32:06",
    },
    {
        delegator: "user4",
        delegatee: "esteemapp",
        vesting_shares: "27751.000000 VESTS",
        timestamp: "2020-02-17T09:28:12",
    },
    {
        delegator: "user5",
        delegatee: "esteemapp",
        vesting_shares: "1957.888055 VESTS",
        timestamp: "2020-03-24T12:42:39",
    },
];
export const withdrawSavingsInstance: SavingsWithdrawRequest[] = [
    {
        amount: "1.000 HIVE",
        complete: "2022-02-06T02:59:27",
        from: "ecency",
        id: 137870,
        memo: "",
        request_id: 3179660325,
        to: "ecency"
    },
];
export const conversionRequestInstance: ConversionRequest[] = [
    {
        amount: "1.000 HBD",
        conversion_date: "2022-02-06T02:59:27",
        id: 137870,
        owner: "ecency",
        requestid: 3179660325
    },
];
export const openOrdersInstance: OpenOrdersData[] = [
    {
        seller: "ecency",
        created: "2022-02-02T17:48:36",
        expiration: "2022-03-01T17:48:33",
        for_sale: 200000,
        id: 5824689,
        orderid: 1643824113,
        real_price: "1.50000000000000000",
        rewarded: false,
        sell_price: {base: '200.000 HIVE', quote: '300.000 HBD'}
    },
];
export const discussionInstace1: Entry[] = [
    {
        post_id: 86423250,
        author: "esteemapp",
        permlink: "esteem-discord-monthly-giveaway-winners-21",
        category: "esteem",
        title: "Esteem Discord Monthly Giveaway Winners #21",
        body: "...",
        json_metadata: {},
        created: "2020-06-06T05:37:51",
        updated: "2020-06-06T05:37:51",
        depth: 0,
        children: 9,
        net_rshares: 23953037130835,
        is_paidout: false,
        payout_at: "2020-06-13T05:37:51",
        payout: 11.432,
        pending_payout_value: "11.432 HBD",
        author_payout_value: "0.000 HBD",
        curator_payout_value: "0.000 HBD",
        promoted: "0.000 HBD",
        replies: [],
        active_votes: [],
        author_reputation: 75.6,
        stats: {hide: false, gray: false, total_votes: 180, flag_weight: 0},
        beneficiaries: [{account: "esteemapp", weight: 300}],
        max_accepted_payout: "1000000.000 HBD",
        percent_hbd: 10000,
        url: "/esteem/@esteemapp/esteem-discord-monthly-giveaway-winners-21",
        blacklists: [],
    },
    {
        post_id: 86437193,
        author: "forykw",
        permlink: "re-esteemapp-202067t12246786z",
        category: "esteem",
        title: "RE: Esteem Discord Monthly Giveaway Winners #21",
        body: "Prizes have consistently been very effective from @esteemapp nicely done!",
        json_metadata: {},
        created: "2020-06-07T00:02:48",
        updated: "2020-06-07T00:02:48",
        depth: 1,
        children: 0,
        net_rshares: 0,
        is_paidout: false,
        payout_at: "2020-06-14T00:02:48",
        payout: 0,
        pending_payout_value: "0.000 HBD",
        author_payout_value: "0.000 HBD",
        curator_payout_value: "0.000 HBD",
        promoted: "0.000 HBD",
        replies: [],
        active_votes: [],
        author_reputation: 64.87,
        stats: {hide: false, gray: false, total_votes: 0, flag_weight: 0},
        beneficiaries: [{account: "esteemapp", weight: 300}],
        max_accepted_payout: "1000000.000 HBD",
        percent_hbd: 10000,
        parent_author: "esteemapp",
        parent_permlink: "esteem-discord-monthly-giveaway-winners-21",
        url: "/esteem/@esteemapp/esteem-discord-monthly-giveaway-winners-21#@forykw/re-esteemapp-202067t12246786z",
        blacklists: [],
    },
    {
        post_id: 86427694,
        author: "brittandjosie",
        permlink: "re-esteemapp-qbi6t3",
        category: "esteem",
        title: "RE: Esteem Discord Monthly Giveaway Winners #21",
        body: "@ardpien congrats on being one of the winners ",
        json_metadata: {tags: ["esteem"], app: "peakd/2020.05.5"},
        created: "2020-06-06T12:03:03",
        updated: "2020-06-06T12:03:03",
        depth: 1,
        children: 1,
        net_rshares: 0,
        is_paidout: false,
        payout_at: "2020-06-13T12:03:03",
        payout: 0,
        pending_payout_value: "0.000 HBD",
        author_payout_value: "0.000 HBD",
        curator_payout_value: "0.000 HBD",
        promoted: "0.000 HBD",
        replies: ["ardpien/re-brittandjosie-qbjoep"],
        active_votes: [],
        author_reputation: 71.78,
        stats: {hide: false, gray: false, total_votes: 0, flag_weight: 0},
        beneficiaries: [],
        max_accepted_payout: "1000000.000 HBD",
        percent_hbd: 10000,
        parent_author: "esteemapp",
        parent_permlink: "esteem-discord-monthly-giveaway-winners-21",
        url: "/esteem/@esteemapp/esteem-discord-monthly-giveaway-winners-21#@brittandjosie/re-esteemapp-qbi6t3",
        blacklists: [],
    },
    {
        post_id: 86426904,
        author: "ardpien",
        permlink: "qbi303",
        category: "esteem",
        title: "RE: Esteem Discord Monthly Giveaway Winners #21",
        body:
            "😃 I am mentioned here. That's great! All thanks to ESTEEM for creating an awesome Discord server for us to talk in there and participate in activities. Thank You ESTEEM team :) and @good-karma.",
        json_metadata: {},
        created: "2020-06-06T10:40:54",
        updated: "2020-06-06T10:40:54",
        depth: 1,
        children: 0,
        net_rshares: 114901996313,
        is_paidout: false,
        payout_at: "2020-06-13T10:40:54",
        payout: 0.031,
        pending_payout_value: "0.031 HBD",
        author_payout_value: "0.000 HBD",
        curator_payout_value: "0.000 HBD",
        promoted: "0.000 HBD",
        replies: [],
        active_votes: [{voter: "jznsamuel", rshares: 114901996313}],
        author_reputation: 47.13,
        stats: {hide: false, gray: false, total_votes: 1, flag_weight: 0},
        beneficiaries: [],
        max_accepted_payout: "1000000.000 HBD",
        percent_hbd: 10000,
        parent_author: "esteemapp",
        parent_permlink: "esteem-discord-monthly-giveaway-winners-21",
        url: "/esteem/@esteemapp/esteem-discord-monthly-giveaway-winners-21#@ardpien/qbi303",
        blacklists: [],
    },
    {
        post_id: 86426429,
        author: "iliyan90",
        permlink: "re-esteemapp-202066t124616772z",
        category: "esteem",
        title: "RE: Esteem Discord Monthly Giveaway Winners #21",
        body: "@esteemapp\nBug report [click here](https://esteem.app/esteem/@iliyan90/bug-report-to-esteemapp)",
        json_metadata: {},
        created: "2020-06-06T09:46:15",
        updated: "2020-06-06T09:46:36",
        depth: 1,
        children: 0,
        net_rshares: 0,
        is_paidout: false,
        payout_at: "2020-06-13T09:46:15",
        payout: 0,
        pending_payout_value: "0.000 HBD",
        author_payout_value: "0.000 HBD",
        curator_payout_value: "0.000 HBD",
        promoted: "0.000 HBD",
        replies: [],
        active_votes: [],
        author_reputation: 60.22,
        stats: {hide: false, gray: false, total_votes: 0, flag_weight: 0},
        beneficiaries: [{account: "esteemapp", weight: 300}],
        max_accepted_payout: "1000000.000 HBD",
        percent_hbd: 10000,
        parent_author: "esteemapp",
        parent_permlink: "esteem-discord-monthly-giveaway-winners-21",
        url: "/esteem/@esteemapp/esteem-discord-monthly-giveaway-winners-21#@iliyan90/re-esteemapp-202066t124616772z",
        blacklists: [],
    },
    {
        post_id: 86425273,
        author: "trincowski",
        permlink: "re-esteemapp-202066t84137915z",
        category: "esteem",
        title: "RE: Esteem Discord Monthly Giveaway Winners #21",
        body: "Awesome. Thank you very much.",
        json_metadata: {},
        created: "2020-06-06T07:41:39",
        updated: "2020-06-06T07:41:39",
        depth: 1,
        children: 0,
        net_rshares: 116060350556,
        is_paidout: false,
        payout_at: "2020-06-13T07:41:39",
        payout: 0.032,
        pending_payout_value: "0.032 HBD",
        author_payout_value: "0.000 HBD",
        curator_payout_value: "0.000 HBD",
        promoted: "0.000 HBD",
        replies: [],
        active_votes: [{voter: "jznsamuel", rshares: 116060350556}],
        author_reputation: 68.52,
        stats: {hide: false, gray: false, total_votes: 1, flag_weight: 0},
        beneficiaries: [{account: "esteemapp", weight: 300}],
        max_accepted_payout: "1000000.000 HBD",
        percent_hbd: 10000,
        parent_author: "esteemapp",
        parent_permlink: "esteem-discord-monthly-giveaway-winners-21",
        url: "/esteem/@esteemapp/esteem-discord-monthly-giveaway-winners-21#@trincowski/re-esteemapp-202066t84137915z",
        blacklists: [],
    },
    {
        post_id: 86423472,
        author: "foxkoit",
        permlink: "re-esteemapp-202066t8590757z",
        category: "esteem",
        title: "RE: Esteem Discord Monthly Giveaway Winners #21",
        body: "Thank you 😀😇😇",
        json_metadata: {},
        created: "2020-06-06T05:59:03",
        updated: "2020-06-06T05:59:03",
        depth: 1,
        children: 0,
        net_rshares: 117230405346,
        is_paidout: false,
        payout_at: "2020-06-13T05:59:03",
        payout: 0.032,
        pending_payout_value: "0.032 HBD",
        author_payout_value: "0.000 HBD",
        curator_payout_value: "0.000 HBD",
        promoted: "0.000 HBD",
        replies: [],
        active_votes: [{voter: "jznsamuel", rshares: 117230405346}],
        author_reputation: 71.51,
        stats: {hide: false, gray: false, total_votes: 1, flag_weight: 0},
        beneficiaries: [{account: "esteemapp", weight: 300}],
        max_accepted_payout: "1000000.000 HBD",
        percent_hbd: 10000,
        parent_author: "esteemapp",
        parent_permlink: "esteem-discord-monthly-giveaway-winners-21",
        url: "/esteem/@esteemapp/esteem-discord-monthly-giveaway-winners-21#@foxkoit/re-esteemapp-202066t8590757z",
        blacklists: [],
    },
    {
        post_id: 86423446,
        author: "irisworld",
        permlink: "re-esteemapp-202066t14588243z",
        category: "esteem",
        title: "RE: Esteem Discord Monthly Giveaway Winners #21",
        body: "yahoo! thanks a lot!",
        json_metadata: {},
        created: "2020-06-06T05:58:09",
        updated: "2020-06-06T05:58:09",
        depth: 1,
        children: 0,
        net_rshares: 265974487101,
        is_paidout: false,
        payout_at: "2020-06-13T05:58:09",
        payout: 0.075,
        pending_payout_value: "0.075 HBD",
        author_payout_value: "0.000 HBD",
        curator_payout_value: "0.000 HBD",
        promoted: "0.000 HBD",
        replies: [],
        active_votes: [{voter: "foo", rshares: 123}, {voter: "bar", rshares: 123}],
        author_reputation: 65.01,
        stats: {hide: false, gray: false, total_votes: 2, flag_weight: 0},
        beneficiaries: [{account: "esteemapp", weight: 300}],
        max_accepted_payout: "1000000.000 HBD",
        percent_hbd: 10000,
        parent_author: "esteemapp",
        parent_permlink: "esteem-discord-monthly-giveaway-winners-21",
        url: "/esteem/@esteemapp/esteem-discord-monthly-giveaway-winners-21#@irisworld/re-esteemapp-202066t14588243z",
        blacklists: [],
    },
    {
        post_id: 86423439,
        author: "behiver",
        permlink: "re-esteemapp-202066t85739415z",
        category: "esteem",
        title: "RE: Esteem Discord Monthly Giveaway Winners #21",
        body:
            "Great to see my name on the Giveaway and I like quite much engaging on Discord and find out what others are doing in the HIVE space. A source of news, common hobbies and other topics that rise up your day.",
        json_metadata: {},
        created: "2020-06-06T05:57:39",
        updated: "2020-06-06T05:57:39",
        depth: 1,
        children: 0,
        net_rshares: 273072542004,
        is_paidout: false,
        payout_at: "2020-06-13T05:57:39",
        payout: 0.077,
        pending_payout_value: "0.077 HBD",
        author_payout_value: "0.000 HBD",
        curator_payout_value: "0.000 HBD",
        promoted: "0.000 HBD",
        replies: [],
        active_votes: [
            {voter: "foxkoit", rshares: 154659337454},
            {voter: "jznsamuel", rshares: 118413204550},
        ],
        author_reputation: 57.66,
        stats: {hide: false, gray: false, total_votes: 2, flag_weight: 0},
        beneficiaries: [{account: "esteemapp", weight: 300}],
        max_accepted_payout: "1000000.000 HBD",
        percent_hbd: 10000,
        parent_author: "esteemapp",
        parent_permlink: "esteem-discord-monthly-giveaway-winners-21",
        url: "/esteem/@esteemapp/esteem-discord-monthly-giveaway-winners-21#@behiver/re-esteemapp-202066t85739415z",
        blacklists: [],
    },
    {
        post_id: 86440916,
        author: "ardpien",
        permlink: "re-brittandjosie-qbjoep",
        category: "esteem",
        title: "RE: Esteem Discord Monthly Giveaway Winners #21",
        body: "Thank you, Miss. @birttandjosie.",
        json_metadata: {tags: ["esteem"], app: "peakd/2020.05.5"},
        created: "2020-06-07T07:20:51",
        updated: "2020-06-07T07:20:51",
        depth: 2,
        children: 0,
        net_rshares: 0,
        is_paidout: false,
        payout_at: "2020-06-14T07:20:51",
        payout: 0,
        pending_payout_value: "0.000 HBD",
        author_payout_value: "0.000 HBD",
        curator_payout_value: "0.000 HBD",
        promoted: "0.000 HBD",
        replies: [],
        active_votes: [],
        author_reputation: 47.13,
        stats: {hide: false, gray: false, total_votes: 0, flag_weight: 0},
        beneficiaries: [],
        max_accepted_payout: "1000000.000 HBD",
        percent_hbd: 10000,
        parent_author: "brittandjosie",
        parent_permlink: "re-esteemapp-qbi6t3",
        url: "/esteem/@esteemapp/esteem-discord-monthly-giveaway-winners-21#@ardpien/re-brittandjosie-qbjoep",
        blacklists: [],
    },
];

export const communityInstance1: Community = {
    id: 1369030,
    name: "hive-148441",
    title: "GEMS",
    about: "To highlight true Gems of Hive community with User Retention as primary objective.",
    lang: "en",
    type_id: 1,
    is_nsfw: false,
    subscribers: 4086,
    sum_pending: 17370,
    num_pending: 12481,
    num_authors: 1796,
    created_at: "2020-02-26 11:33:33",
    avatar_url: "",
    description:
        "This is a collective curation community formed by @appreciator, @rocky1 and @upmewhale. You can post your genuine and creative content in this community to get more support.\n\n\nYou can post in languages other than English.\n\nThere are not many restrictions but just few simple ones and we expect you to adhere to them\n\nJoin our discord group to keep yourself updated:\nhttps://discord.gg/n98Kpmm",
    flag_text: "Plagiarism will be highly discouraged.\nHate Speech is not allowed",
    settings: {},
    team: [
        ["hive-148441", "owner", ""],
        ["bluemist", "admin", ""],
    ],
};

export const dynamicPropsIntance1: DynamicProps = {
    hivePerMVests: 513.7574961580294,
    base: 0.252,
    quote: 1,
    fundRecentClaims: 413504197028183900,
    fundRewardBalance: 848692.443,
    hbdPrintRate: 10000,
    hbdInterestRate: 1000,
    headBlock: 59000000,
    totalVestingFund: 147530899.832,
    totalVestingShares: 274146627336.063918,
    virtualSupply: 395012207.852,
    vestingRewardPercent: 1500,
};

export const notificationsInstance1: Notifications = {
    filter: null,
    unread: 0,
    list: [],
    loading: false,
    hasMore: true,
    unreadFetchFlag: true
}

export const apiVoteNotification: ApiVoteNotification = {
    "id": "v-705431149",
    "type": "vote",
    "source": "fooo10",
    "voter": "fooo10",
    "weight": 10000,
    "author": "good-karma",
    "permlink": "update-on-hivesigner-integration-into-condenser",
    "title": "Update on Hivesigner integration into Condenser",
    "img_url": null,
    "read": 0,
    "timestamp": "2020-07-24T06:50:48+00:00",
    "ts": 1595566248,
    "gk": "2 hours",
    "gkf": true
}

export const apiMentionNotification: ApiMentionNotification = {
    "id": "m-49590315",
    "type": "mention",
    "source": "ecency.stats",
    "author": "ecency.stats",
    "account": "good-karma",
    "permlink": "daily-activities-points-2020-07-24",
    "post": true,
    "title": "Daily activities [Points] - Jul 24",
    "img_url": "https://images.ecency.com/0x0/https://img.esteem.app/08zx2x.jpg",
    "read": 0,
    "timestamp": "2020-07-24T01:10:09+00:00",
    "ts": 1595545809,
    "gk": "8 hours",
    "gkf": true
};

export const apiFollowNotification: ApiFollowNotification = {
    "id": "f-174272007",
    "type": "follow",
    "source": "fooo10",
    "follower": "fooo10",
    "following": "good-karma",
    "blog": true,
    "read": 0,
    "timestamp": "2020-07-24T06:08:24+00:00",
    "ts": 1595563704,
    "gk": "2 hours",
    "gkf": true
}

export const apiUnfollowNotification: ApiFollowNotification = {
    "id": "f-174258147",
    "type": "unfollow",
    "source": "fooo102",
    "follower": "fooo102",
    "following": "good-karma",
    "blog": false,
    "read": 1,
    "timestamp": "2020-07-19T05:07:09+00:00",
    "ts": 1595128029,
    "gk": "2020-07-19",
    "gkf": false
}

export const apiReplyNotification: ApiReplyNotification = {
    "id": "rr-108155773",
    "type": "reply",
    "source": "dunsky",
    "author": "dunsky",
    "permlink": "re-good-karma-2020721t1915968z",
    "title": "",
    "body": "Testing replies from Ecency web interface \ud83d\ude0e",
    "json_metadata": "{\"tags\": [\"ecency\"], \"app\": \"ecency/0.0.1-vision\", \"format\": \"markdown+html\"}",
    "metadata": {
        "tags": [
            "ecency"
        ],
        "app": "ecency/0.0.1-vision",
        "format": "markdown+html"
    },
    "parent_author": "good-karma",
    "parent_permlink": "re-dunsky-2020713t164324912z",
    "parent_title": null,
    "parent_img_url": null,
    "read": 1,
    "timestamp": "2020-07-21T16:02:00+00:00",
    "ts": 1595340120,
    "gk": "2020-07-21",
    "gkf": false
}

export const apiReblogNotification: ApiReblogNotification = {
    "id": "r-10661404",
    "type": "reblog",
    "source": "foo220",
    "account": "foo220",
    "author": "good-karma",
    "permlink": "update-on-hivesigner-integration-into-condenser",
    "title": "Update on Hivesigner integration into Condenser",
    "img_url": null,
    "read": 0,
    "timestamp": "2020-07-23T13:36:06+00:00",
    "ts": 1595504166,
    "gk": "Yesterday",
    "gkf": true
}

export const apiTransferNotification: ApiTransferNotification = {
    "id": "t-62284775",
    "type": "transfer",
    "source": "bar212",
    "to": "good-karma",
    "amount": "900.000 HBD",
    "memo": "",
    "read": 1,
    "timestamp": "2020-07-20T09:30:21+00:00",
    "ts": 1595230221,
    "gk": "2020-07-20",
    "gkf": true
}

export const apiNotificationList1: ApiNotification[] = [
    apiVoteNotification,
    apiMentionNotification,
    apiFollowNotification,
    apiUnfollowNotification
]

export const apiNotificationList2: ApiNotification[] = [
    apiReplyNotification,
    apiReblogNotification,
    apiTransferNotification
]

export const pointTransactionsInstance: PointTransaction[] = [
    {
        amount: "0.250",
        created: "2020-08-17T12:52:16.737322+02:00",
        id: 5150947,
        memo: null,
        receiver: null,
        sender: null,
        type: 10,
    },
    {
        amount: "0.750",
        created: "2020-08-17T10:01:22.094361+02:00",
        id: 5149418,
        memo: null,
        receiver: null,
        sender: null,
        type: 120,
    }
];

export const proposalInstance: Proposal = {
    "id": 88,
    "proposal_id": 88,
    "creator": "good-karma",
    "receiver": "ecency",
    "start_date": "2020-04-15T00:00:00",
    "end_date": "2022-04-15T00:00:00",
    "daily_pay": {"amount": "70000", "precision": 3, "nai": "@@000000013"},
    "subject": "Hivesigner - Ongoing development and improvement",
    "permlink": "hivesigner-ongoing-development-and-improvement",
    "total_votes": "59038534209195740",
    "status": "active"
}

export const searchResponseInstance: SearchResponse = {
    hits: 20,
    took: 1,
    results: [{
        "id": 98392151,
        "author": "good-karma",
        "permlink": "imagehoster-hivesigner-and-condenser-bounty",
        "category": "ecency",
        "children": 33,
        "author_rep": "77.07",
        "title": "Imagehoster + Hivesigner and Condenser bounty",
        "title_marked": null,
        "body": "Hello everyone,\n\nEarlier in [Hivesigner updates](/hive/@good-karma/hivesigner-ongoing-development-and-improvement), I mentioned that [integrating Hivesigner into Hive.blog](https://gitlab.syncad.com/hive/condenser/-/issues/43) would be huge steps for giving similar user experience across Hive applications.\n\nOne of the first steps were to solve Imagehoster issue or rather expand it to allow image uploads if user Logged in via Hivesigner.\n\n![](https://images.ecency.com/p/Y2iXpRRkNSnseh3NuL6KUBitJTXrc5K2vbTzBseGEENcE)\n\n## Imagehoster + Hivesigner\n\nImagehoster works by signing image file with user's private key and then use signature to upload image file. On server side, signature is verified with image file content and accepted/stored.\n\nHivesigner being OAuth2 works slightly different, so we couldn't sign the image file before uploading to Imagehoster because we don't have access to user's private keys. But each application has `accessToken` issued by Hivesigner with user's permission. [I just created Merge Request into Imagehoster](https://gitlab.syncad.com/hive/imagehoster/-/merge_requests/1) which uses `accessToken` for verifying application, user account and uploads image.\n\nOnce accepted by @blocktrades team, we can start working on next step [Condenser Hivesigner integration](https://gitlab.syncad.com/hive/condenser/-/issues/43). \n\n## Condenser Bounty\n\nIf you are familiar with condenser source code: https://gitlab.syncad.com/hive/condenser, here is a challenge and programming task to get first hand experience on how Condenser and Hivesigner works, earn extra reward while learning.\n\nAnnouncing Bounty for integrating Hivesigner OAuth2 into hive.blog and wallet.hive.blog.\n\n**Bounty prize: 1000 HBD**\nRelated issue: https://gitlab.syncad.com/hive/condenser/-/issues/43\n\nIntegration examples to get started: Esteem/Ecency [desktop](https://github.com/esteemapp/esteem-surfer/blob/master/app/helpers/sc.js) and [mobile](https://github.com/esteemapp/esteem-mobile/blob/development/src/providers/steem/steemConnect.js) apps, as well as https://demo.hivesigner.com.\n\n\nIf anyone interested adding into prize pool, please feel free to reach out or leave a comment.\n\n# Hive on!\n\n## Support Hivesigner\n\n- [Read details of Hivesigner proposal](https://esteem.app/hive/@good-karma/hivesigner-ongoing-development-and-improvement)\n- [Vote for proposal using Hivesigner](https://hivesigner.com/sign/update-proposal-votes?proposal_ids=%5B88%5D&approve=true)\n- PeakD: https://peakd.com/proposals/88\n- HiveBlog Wallet: https://wallet.hive.blog/proposals\n- Discord: https://discord.gg/pNJn7wh",
        "body_marked": "Bounty prize: 1000 HBD\nRelated issue: https://gitlab.syncad.com/hive/condenser/-/issues/43\n\nIntegration examples to get started: Esteem/<mark>Ecency</mark> desktop and mobile apps, as well as https://demo.hivesigner.com",
        "img_url": "",
        "payout": 156.262,
        "total_votes": 742,
        "up_votes": 702,
        "created_at": "2020-07-07T16:03:48+00:00",
        "tags": ["hive-139531", "hivesigner", "imagehoster", "hive", "development", "upload", "dapps"],
        "app": "esteem/2.2.7-surfer",
        "depth": 0
    }, {
        "id": 99070579,
        "author": "ecency",
        "permlink": "ecency-vision-no-beneficiaries-drafts-gallery-bookmarks",
        "category": "ecency",
        "children": 32,
        "author_rep": "70.29",
        "title": "Ecency Vision - No beneficiaries, Drafts, Gallery, Bookmarks",
        "title_marked": "<mark>Ecency</mark> Vision - No beneficiaries, Drafts, Gallery, Bookmarks",
        "body": "\nExcited to share, new major updates into Ecency website. Read on to learn more and try it out.\n\n![visionlike.png](https://images.ecency.com/DQmeEPc82iSe7NRBfBsnBcduJRfrhmFkYCGvfrSsZNfKX7r/visionlike.png)\n\n## What's new\n\n- No beneficiaries, that's right, we are removing 1% beneficiary reward. We were the first one to adopt beneficiaries when it was introduced and rewards did help us over the years to at least cover some part of server costs. After re-evaluating recently we decided to drop it altogether.\n- Drafts, now you can access your drafts which you saved from mobile app or save drafts, re-use old drafts, vice versa.\n- Bookmarks and Favorites, also added Bookmarking post and Favoriting authors so you can quickly access your favorities. It is synced across the device of course, you can check your bookmarks from mobile app and vice versa.\n- Gallery, all your uploaded images are available in your Gallery page, so you can re-use them quickly or download them when you need again.\n- Recent posts, great way to read more from same author, now wether you are reading post or comment, you get chance to read more from same author and connect.\n- Code improvements and optimization, we want to keep codebase clean and performance top notch possible, so regular optimization. Also after couple more updates, we will opensource website entirely so you can take a look and help if have development experience.\n\n---\nMobile application will also get update in next 48 hours with improvements, bug fixes and of course, no beneficiary rewards or fees.\n\nStay tuned, stay excited! Don't forget to share news with your friends.\n\n## Web https://ecency.com\n## iOS https://ios.ecency.com\n## Android https://android.ecency.com\n\n<center>`hello@ecency.com`\n🌐[`Ecency.com`](https://ecency.com) | ✍🏻 [`Telegram`](https://t.me/ecency) | 💬[`Discord`](https://discord.me/ecency)\n  [`Approve Hivesigner`](https://hivesigner.com/sign/update-proposal-votes?proposal_ids=%5B88%5D&approve=true) | [`Approve Hivesearcher`](https://hivesigner.com/sign/update-proposal-votes?proposal_ids=%5B114%5D&approve=true)\n[![Vote for @good-karma as a witness](https://images.ecency.com/p/o1AJ9qDyyJNSpZWhUgGYc3MngFqoAN2qn9AiTn8UpLP6Qb5TL?format=match&mode=fit)](https://hivesigner.com/sign/account-witness-vote?witness=good-karma&approve=1)\n</center> \n",
        "body_marked": "Excited to share, new major updates into <mark>Ecency</mark> website. Read on to learn more and try it out.\n\n\n\nWhat's new\n\n\nNo beneficiaries, that's right, we are removing 1% beneficiary reward.",
        "img_url": "https://images.ecency.com/DQmeEPc82iSe7NRBfBsnBcduJRfrhmFkYCGvfrSsZNfKX7r/visionlike.png",
        "payout": 154.396,
        "total_votes": 368,
        "up_votes": 355,
        "created_at": "2020-08-14T16:57:36+00:00",
        "tags": ["ecency", "hive-125125", "development", "communities", "hive", "updates", "dapp"],
        "app": "ecency/3.0.3-vision",
        "depth": 0
    }, {
        "id": 98016568,
        "author": "good-karma",
        "permlink": "from-esteem-search-to-hivesearcher",
        "category": "ecency",
        "children": 26,
        "author_rep": "77.07",
        "title": "From Esteem Search to Hivesearcher",
        "title_marked": null,
        "body": "Part of making Esteem Search Engine more open is to make it separate brand and service. Since [Esteem is rebranding to Ecency](https://esteem.app/ecency/@esteemapp/from-esteem-to-ecency), it is perfect time to do just that. \n\n## Introducing Hivesearcher\n\nWe will be moving https://search.esteem.app to https://hivesearcher.com as a part of [our proposal work](https://esteem.app/hive/@good-karma/open-search-engine-development-and-maintenance). Here is the simple magnifying Hivesearcher logo with Hive flavor.\n\n<center>![hivesearcher-thumbnail](https://images.esteem.app/DQmcAKfEJdgj55sTB3gWTVMzw6WtZ5K9V3uwbH83DA9a8QM/thumbnail.png)</center>\n\nOnce migration is completed for Backend API and Frontend, we will make separate post about it and ask dapp developers/owners to migrate into new endpoints.\n\n### Recent updates\n\nLittle over a month ago, we have made some improvements to search and added extra indexing for communities, requested by Peakd team.\n\nCommunities use `category` field when content is created, so you can search for posts from certain category like this:\n`https://search.esteem.app/search?q=* category:hive type:post` \nor community: \n`https://search.esteem.app/search?q=* category:hive-139531 type:post`\n\nDue to increase in size of index, we had to add one more cluster/server to Elasticsearch. Things are running smoothly so far, but we can do better, improve rankings and add different ranking options, etc.\n\nWe would like to Thank everyone who took their time to support proposal and do their part to improve search engine and make it open for all developers.\n\nHivesearcher needs your support to help us improve the system for everyone and open access to all Dapps. And potentially creating more new apps with better discovery features.\n\n\n## Support proposal\n\n- [Read details of Hivesearcher proposal](https://esteem.app/hive/@good-karma/open-search-engine-development-and-maintenance)\n- [Vote for proposal using Hivesigner](https://hivesigner.com/sign/update-proposal-votes?proposal_ids=%5B114%5D&approve=true)\n- HiveBlog Wallet: https://wallet.hive.blog/proposals\n- PeakD: https://peakd.com/proposals/114\n- HiveDao: https://hivedao.com/proposal/114\n- Sourcecode: https://github.com/esteemapp/hive2elastic",
        "body_marked": "Since Esteem is rebranding to <mark>Ecency</mark>, it is perfect time to do just that.",
        "img_url": "https://images.esteem.app/DQmcAKfEJdgj55sTB3gWTVMzw6WtZ5K9V3uwbH83DA9a8QM/thumbnail.png",
        "payout": 150.911,
        "total_votes": 609,
        "up_votes": 576,
        "created_at": "2020-06-17T10:44:42+00:00",
        "tags": ["hive-139531", "hivesearcher", "proposal", "hive", "elasticsearch", "dhf", "search", "discovery"],
        "app": "esteem/2.2.7-surfer",
        "depth": 0
    }, {
        "id": 98569007,
        "author": "ecency",
        "permlink": "ecency-development-update-17-07-2020",
        "category": "ecency",
        "children": 27,
        "author_rep": "70.29",
        "title": "Ecency development update 17/07/2020",
        "title_marked": "<mark>Ecency</mark> development update 17/07/2020",
        "body": "Hello everyone,\n\nWe are 5 days away from [official release of Ecency](/ecency/@esteemapp/from-esteem-to-ecency) (22/7/2020). After release of Ecency website, we will be rolling out Ecency mobile and desktop apps with improvements we have been working on. If you missed last [development update read about it here](/ecency/@ecency/ecency-development-update-09-07-2020). In this post we will talk about some changes in mobile and desktop apps.\n\n![Ecency-release-logo](https://images.ecency.com/DQmdWiLkE1ccp9UYnXbz6ofsxkUhYQo1eCh9X24kKLYTk3a/ecency_announcement.png)\n\n# Ecency Web\n\nFirst, let us start with progress of website. We have all social features implemented, these days finalizing wallet and points operations. We think for initial release we have majority of the features we want and after official release and rebrand, we will continue to add features you all love. While keeping performance of website top-notch.\n\n# Ecency Mobile\n\nMobile app will have better support for communities, new branding images, improvements in push notifications, signup within app in seconds, request delegation boost if you run out of RC, with app it is super easy, couple clicks away and you are good to continue enjoying Hive experience. Search page will also get improvement which will include community posts and unified search feature. Many more design and post rendering improvements, bug fixes. Ecency website will have mobile friendly interface as well, so we expect mobile and website experience will compliment each other.\n\n# Ecency Desktop\n\nFor last couple years, we have put most of our efforts into this product (Esteem Desktop/Surfer app) instead of developing website. It was great experience but we learnt that in today's world not many people prefer installing apps on their computer. Desktop apps are more secure and unstoppable, so we are going to continue preserve desktop app for as long as we can. Because it serves decent number of people who like more security and privacy in crypto space.  We will likely port our new website into desktop application.\nIn desktop app, you have full control over which server you connect to, you have full control of your private keys and it gives you access to truly uncensored data. Websites are prone to DMCA and other government laws and they are enforced by domain/server service providers, but desktop apps doesn't have such limitation making them best way to access uncensored content. After website and mobile updates, we will publish update into Ecency desktop application as well. \n\nStay tuned, stay excited! \n\n<center>`hello@ecency.com`\n🌐[`Ecency.com`](https://ecency.com) | ✍🏻 [`Telegram`](https://t.me/ecency) | 💬[`Discord`](https://discord.me/ecency)\n  [`Approve Hivesigner`](https://hivesigner.com/sign/update-proposal-votes?proposal_ids=%5B88%5D&approve=true) | [`Approve Hivesearcher`](https://hivesigner.com/sign/update-proposal-votes?proposal_ids=%5B114%5D&approve=true)\n[![Vote for @good-karma as a witness](https://images.ecency.com/p/o1AJ9qDyyJNSpZWhUgGYc3MngFqoAN2qn9AiTn8UpLP6Qb5TL?format=match&mode=fit)](https://hivesigner.com/sign/account-witness-vote?witness=good-karma&approve=1)\n</center>",
        "body_marked": "Hello everyone,\n\nWe are 5 days away from official release of <mark>Ecency</mark> (22/7/2020).",
        "img_url": "",
        "payout": 141.374,
        "total_votes": 275,
        "up_votes": 251,
        "created_at": "2020-07-17T11:35:54+00:00",
        "tags": ["ecency", "esteem", "hive", "development", "desktop", "mobile", "dapp", "rebrand", "release"],
        "app": "ecency/0.0.1-vision",
        "depth": 0
    }, {
        "id": 97501254,
        "author": "good-karma",
        "permlink": "open-search-engine-development-and-maintenance",
        "category": "hive",
        "children": 34,
        "author_rep": "77.07",
        "title": "Open Search Engine development and maintenance ",
        "title_marked": null,
        "body": "This proposal is a request for funding to pay for the development and maintenance of search engine that provides search functionality to hive.blog, peak.com, ecency.com and other potential Hive apps.\n\n# Project Title\n\nOpen Search Engine development and maintenance\n\n<center>![Blockchain-based-Open-Search-Engine](https://images.ecency.com/DQmcAKfEJdgj55sTB3gWTVMzw6WtZ5K9V3uwbH83DA9a8QM/thumbnail.png)</center>\n\n# Proposal Type\n\nHive service - Opensource\n\n# Costs\n\n**Daily: 45 HBD**\nMonthly: 1350 HBD\n\n---\n\nLabor (Development+Management): ~25 hours per month, 750 HBD\nRecurring costs (Servers): ~$600, ~600 HBD\n\nProgress reporting: Bi-Weekly\n\n# Project Summary\n\n## Project description\n\nSearch engine is based on [Elasticsearch](https://www.elastic.co/) and it is best in one thing, indexing and searching content. Current version of Search Engine is working good but we want to improve it so content ranking and indexing works better within community searches, optimize fields, add check for efficiency and of course we want to provide Open API access to all who wants to build on Hive. \n\nHome: https://hivesearcher.com\nGithub: https://github.com/ecency/hive2elastic\n\n## Benefits\n\nRight now, Search engine is used by all major frontends, **Hive.blog, Peakd.com and Ecency.com** and to cover part of the server costs, we have monthly payment for API key and plans with limited access. We want to remove those limits and open it up for every app to integrate. https://search.esteem.app/api-register\nThere are potentially unlimited opportunities for developers to increase exposure or create new types of apps, content discovery could be improved by different creative approaches.\n\n## What happens if the proposal becomes unfunded?\n\nIn case proposal becomes unfunded, we will continue to have monthly fees or increase fees to cover server cost with not much development. It will likely end up being non-sustainable and every app creating their own private versions costing even more and unstable user experience. And difficult to potential new developers/apps to integrate and use.\n\n## Explanation of proposal costs\n\nIn terms of development, as mentioned above, we will improve indexing and ranking, introduce new filters. New indexing will increase server costs as Elastic search will need new cluster and more storage to handle indexes. We are creating this proposal for just 6 months. After 6 months, we will create new proposal with smaller amount just to cover server costs. We think, by then not much new development will be needed.\n\n# Support this proposal\n\n[Vote for this Proposal using Hivesigner](https://hivesigner.com/sign/update-proposal-votes?proposal_ids=%5B114%5D&approve=true)\nHiveDao: https://hivedao.com/proposal/114\nPeakD: https://peakd.com/proposals/114\nHiveBlog Wallet: https://wallet.hive.blog/proposals\nGithub: https://github.com/ecency/hive2elastic\n\n# Progress update\n\n- [From Esteem Search to Hivesearcher - 06/17/2020](https://ecency.com/hive-139531/@good-karma/from-esteem-search-to-hivesearcher)\n- [Hivesearcher vs Hivemind Search - 06/24/2020](https://ecency.com/hive/@good-karma/hivesearcher-vs-hivemind-search)\n- [Hivesearcher.com alive - 07/27/2020](https://ecency.com/search/@good-karma/hivesearcher-com-is-alive)\n- [Free, integrate it into your Hive apps - 09/10/2020](https://ecency.com/hive-139531/@good-karma/hivesearcher-free-integrate-it-into-your-hive-apps)\n- [Hivesearcher updates after HF24 - 11/09/2020](https://ecency.com/hive-139531/@good-karma/hivesearcher-update-indexing-improvements)\n- [Hivesearcher website opensourced - 11/27/2020](https://ecency.com/hive-139531/@good-karma/hivesearcher-website-opensourced)",
        "body_marked": "Home: https://hivesearcher.com\nGithub: https://github.com/<mark>ecency</mark>/hive2elastic\n\nBenefits\n\nRight now, Search engine is used by all major frontends, Hive.blog, Peakd.com and Ecency.com and to cover part of",
        "img_url": "https://images.ecency.com/DQmcAKfEJdgj55sTB3gWTVMzw6WtZ5K9V3uwbH83DA9a8QM/thumbnail.png",
        "payout": 141.303,
        "total_votes": 542,
        "up_votes": 515,
        "created_at": "2020-05-21T09:50:24+00:00",
        "tags": ["hive", "search", "open", "api", "dhf", "proposal", "hivesearcher"],
        "app": "esteem/2.2.7-surfer",
        "depth": 0
    }, {
        "id": 98436511,
        "author": "ecency",
        "permlink": "ecency-development-update-09-07-2020",
        "category": "ecency",
        "children": 44,
        "author_rep": "70.29",
        "title": "Ecency development update 10/07/2020",
        "title_marked": "<mark>Ecency</mark> development update 10/07/2020",
        "body": "Hello everyone,\n\nWe are 12 days away from [official release of Ecency](https://esteem.app/ecency/@esteemapp/from-esteem-to-ecency) (22/7/2020). We have been hard at work developing website and improving tech, background services to handle new product releases. We will post some updates until release to give overview of what to expect and how things will work.\n\n![Ecency-release-logo](https://images.ecency.com/DQmdWiLkE1ccp9UYnXbz6ofsxkUhYQo1eCh9X24kKLYTk3a/ecency_announcement.png)\n\nCurrent implementation of https://esteem.app was good, it was quite fast but we wanted to push our limits to make it even more faster and beautiful to explore communities, discover better content and authors. Add login and account management on top of it.\n\nLoading time is one of the most important factor for us. We want you to enjoy website that loads really fast. Really happy with results so far, we are also experimenting with different user experience to balance speed and convenience. After release, we will gather your feedback and improve features gradually that benefits you. \n\n-----\n\nEsteem has one of the best multi-account management and login system, with Ecency website we are first rolling out Login with [Hivesigner](https://hivesigner.com). We think, you will enjoy managing your accounts and login with ease.\n\n-----\n\nWe are also using our own instance of [Imagehoster](https://esteem.app/hive-139531/@good-karma/imagehoster-hivesigner-and-condenser-bounty).\nLast few months we have experimented with different image hosting and proxying solutions. Perhaps will make separate post about what we tried and what was outcomes of different solutions. Our team is small but we knew we could setup our own, decent imagehoster instance to keep things more decentralized. So far, from our tests, we can see that it is performing really well. We are eager to see performance of it in production once we release website.\n\n-----\n\nEsteem points (ESTM), will also be migrated into Ecency with just placeholder name Points. We have learned a lot over last few months about how points are helping you to stay active and bootstrap your social experience, etc. so Points will be part of Ecency as well.\n\nhttps://ecency.com will have all of above and more.\n\nMobile app and desktop apps will also get fresh look with our new brand images. Many more improvements, which we will talk in separate posts.\n\nStay tuned, stay excited! \n\n<center>`hello@ecency.com`\n🌐[`Ecency.com`](https://ecency.com) | ✍🏻 [`Telegram`](https://t.me/ecency) | 💬[`Discord`](https://discord.me/ecency)\n  [`Approve Hivesigner`](https://hivesigner.com/sign/update-proposal-votes?proposal_ids=%5B88%5D&approve=true) | [`Approve Hivesearcher`](https://hivesigner.com/sign/update-proposal-votes?proposal_ids=%5B114%5D&approve=true)\n[![Vote for @good-karma as a witness](https://images.ecency.com/p/o1AJ9qDyyJNSpZWhUgGYc3MngFqoAN2qn9AiTn8UpLP6Qb5TL?format=match&mode=fit)](https://hivesigner.com/sign/account-witness-vote?witness=good-karma&approve=1)\n</center>",
        "body_marked": "Esteem points (ESTM), will also be migrated into <mark>Ecency</mark> with just placeholder name Points.",

        "img_url": "https://images.ecency.com/DQmdWiLkE1ccp9UYnXbz6ofsxkUhYQo1eCh9X24kKLYTk3a/ecency_announcement.png",
        "payout": 140.633,
        "total_votes": 348,
        "up_votes": 314,
        "created_at": "2020-07-10T04:31:51+00:00",
        "tags": ["ecency", "esteem", "hive", "dapp", "rebrand", "release", "development"],
        "app": "esteem/2.2.7-surfer",
        "depth": 0
    }, {
        "id": 98660709,
        "author": "ecency",
        "permlink": "announcing-ecency-vision",
        "category": "ecency",
        "children": 80,
        "author_rep": "70.29",
        "title": "Announcing Ecency Vision",
        "title_marked": "Announcing <mark>Ecency</mark> Vision",
        "body": "We just released Ecency Vision, our new website with new name and new look. Vision is codename for our website application, we couldn't be more happier to share it with you. \n\n![Ecency-Vision-released](https://images.ecency.com/DQmbPZ9E664fprftktVoXFGbNxxVoPH79HX4nDDr8TrCFKo/2020-07-22_16-33-41.png)\n\nIt is simple, fast and elegant. This is very early phase of website and we would love to hear your thoughts and feedback!\n\nThere are number of other changes in pipeline and in coming days we will roll them out. Most of the work on backend has been completed so most of the upcoming changes will be new features. For now, we will let you explore https://ecency.com but first here are some quick notes.\n\n## What's new\n\n- New website (new development stack, new name, new domain)\n- New app account (ecency.app)\n- New navigation and user flow\n- New beneficiary (~~3%~~ 1%)\n- New image hoster/upload instance\n- New mobile friendly user interface\n- New communities explorer\n- New wallet page\n- New continuous integrations and deployments \n- Drafts, bookmarks - coming very soon\n- Points integration - coming very soon\n- Activities integration - coming very soon\n- Notifications - coming soon\n\nWe have long list of missing features, that needs to be integrated with our existing infrastructure like signups, drafts, bookmarks, points, activities etc. so we will add them one after another. Big milestone is achieved, most of the heavy work related to backend and services completed. We will need your help testing it now.\n\nGive Ecency a try and let us know if you find any issues! \n\nMobile updates also ready, we will do final tests and publish updates to Google PlayStore and AppStore this week. Mobile app has some exciting changes that makes your interaction with different communities super easy.\n\nStay tuned, stay excited! Don't forget to share news with your friends.\n\n# Try https://ecency.com\n\n<center>`hello@ecency.com`\n🌐[`Ecency.com`](https://ecency.com) | ✍🏻 [`Telegram`](https://t.me/ecency) | 💬[`Discord`](https://discord.me/ecency)\n  [`Approve Hivesigner`](https://hivesigner.com/sign/update-proposal-votes?proposal_ids=%5B88%5D&approve=true) | [`Approve Hivesearcher`](https://hivesigner.com/sign/update-proposal-votes?proposal_ids=%5B114%5D&approve=true)\n[![Vote for @good-karma as a witness](https://images.ecency.com/p/o1AJ9qDyyJNSpZWhUgGYc3MngFqoAN2qn9AiTn8UpLP6Qb5TL?format=match&mode=fit)](https://hivesigner.com/sign/account-witness-vote?witness=good-karma&approve=1)\n</center>",
        "body_marked": "We just released <mark>Ecency</mark> Vision, our new website with new name and new look. Vision is codename for our website application, we couldn't be more happier to share it with you.",
        "img_url": "",
        "payout": 117.543,
        "total_votes": 336,
        "up_votes": 312,
        "created_at": "2020-07-22T15:31:27+00:00",
        "tags": ["ecency", "vision", "website", "esteem", "development"],
        "app": "ecency/3.0.0-vision",
        "depth": 0
    }, {
        "id": 98836876,
        "author": "ecency",
        "permlink": "ecency-mobile-rebrand-better-onboarding-communities-and-more",
        "category": "ecency",
        "children": 132,
        "author_rep": "70.29",
        "title": "Ecency Mobile - Rebrand, better onboarding, communities and more",
        "title_marked": "<mark>Ecency</mark> Mobile - Rebrand, better onboarding, communities and more",
        "body": "Finally, we have pushed major version release of our Mobile application. In this post we will briefly talk about changes included in this release.\n\n![mobile_release.jpg](https://images.ecency.com/DQmPqJYKFBEk6YNW7oiekDvRYEMy3kwfFFUDkNsk4mL3Hww/mobile_release.jpg)\n\nThis is huge update with packed improvements and new additions. [Over 10,000 commits in this release PR](https://github.com/ecency/ecency-mobile/pull/1630), part of it from reorganising some parts of app. 😮 Listing all changes probably will take pages of writing. We will mention major ones.\n\n# What's new in v3.0.0\n\n- Rebranding changes to Ecency\n- Better onboarding, delegation request for new accounts, new accounts who run out of RC after signup with Ecency, can easily request for delegation for 30 days from app with single click\n- Communities, explorer, search, find new communities and join, check posts in those communities, we will continue to add more features in these sections \n- Better Search page, includes Communities, Posts, Users, Tags, discovering and searching become even more easy and fun\n- Notifications changed from deprecated Appcenter Push to FCM, this will allow us to offer more flexible notifications in future.\n- Beneficiary lowered to 1%, to continue consistency with website, we are lowering beneficiary reward that helps us to support further development, from 3% to %1, more rewards to our community\n- Native Sharing, you can now select image, link, text and share on Ecency directly and app will quickly put content into editor for your publishing\n- Image uploads and proxy changed to follow our recent updates\n- Post renderer fixes, some image/table rendering improvements\n- Many many bug fixes and improvements\n- **Hivesigner logged in users will have relogin due to rebranding account changes.**\n\nIn next couple updates, we are going to focus on performance improvements. Mobile app is full of features and sometimes, we have to revisit and improve components so performance can be better. If you are React Native developer, feel free to join and help, [our mobile application is opensource](https://github.com/ecency/ecency-mobile).\n\n<center>![Ecency-animation-wave-heart](https://images.ecency.com/DQmTzf1nUY6yaKbvsdND3pBRSGoHhfq4RvxNprT73SvyFn7/animation_500_kdb94s1q.gif)</center>\n\nStay tuned, stay excited! Don't forget to share news with your friends.\n\n## Web https://ecency.com\n## iOS https://ios.ecency.com\n## Android https://android.ecency.com\n\n<center>`hello@ecency.com`\n🌐[`Ecency.com`](https://ecency.com) | ✍🏻 [`Telegram`](https://t.me/ecency) | 💬[`Discord`](https://discord.me/ecency)\n  [`Approve Hivesigner`](https://hivesigner.com/sign/update-proposal-votes?proposal_ids=%5B88%5D&approve=true) | [`Approve Hivesearcher`](https://hivesigner.com/sign/update-proposal-votes?proposal_ids=%5B114%5D&approve=true)\n[![Vote for @good-karma as a witness](https://images.ecency.com/p/o1AJ9qDyyJNSpZWhUgGYc3MngFqoAN2qn9AiTn8UpLP6Qb5TL?format=match&mode=fit)](https://hivesigner.com/sign/account-witness-vote?witness=good-karma&approve=1)\n</center>",
        "body_marked": "What's new in v3.0.0\n\n\nRebranding changes to <mark>Ecency</mark>\nBetter onboarding, delegation request for new accounts, new accounts who run out of RC after signup with <mark>Ecency</mark>, can easily request for delegation for",
        "img_url": "https://images.ecency.com/DQmPqJYKFBEk6YNW7oiekDvRYEMy3kwfFFUDkNsk4mL3Hww/mobile_release.jpg",
        "payout": 116.305,
        "total_votes": 470,
        "up_votes": 448,
        "created_at": "2020-08-01T14:23:57+00:00",
        "tags": ["ecency", "hive-125125", "development", "mobile", "communities", "rebranding", "onboarding"],
        "app": "ecency/3.0.1-vision",
        "depth": 0
    }]
}

export const accountSearchResultInstance: AccountSearchResult[] = [
    {"name": "foo", "full_name": "Foo", "about": "Lorem ipsum dolor sit amet", "reputation": 70.44},
    {"name": "bar", "full_name": "Bar", "about": "Lorem ipsum dolor sit amet", "reputation": 72.44},
    {"name": "baz", "full_name": "Baz", "about": "Lorem ipsum dolor sit amet", "reputation": 74.44},
]

export const assetSymbolInstance: AssetSymbol = "HBD"

export const emptyReblogs: Reblogs = {list: [], canFetch: true}
