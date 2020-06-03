import { State as GlobalState, Filter, Theme, ListStyle } from "../store/global/types";
import { Entry } from "../store/entries/types";
import { Community } from "../store/community/types";

export const globalInstance: GlobalState = {
  filter: Filter.hot,
  tag: "",
  theme: Theme.day,
  listStyle: ListStyle.row,
  intro: true,
  currency: "usd",
  currencyRate: 1,
  currencySymbol: "$",
};

export const entryInstance1: Entry = {
  post_id: 86342505,
  author: "good-karma",
  permlink: "awesome-hive",
  category: "hive",
  title: "Awesome Hive",
  body:
    "Hey developers,\n\n![awesome-hive.png](https://images.esteem.app/DQmetNmv6rtcRxueXJSNm7ErLLKNYGJETxsNSoehn6xk9BC/awesome-hive.png)\n\nI just created [Awesome-Hive](https://github.com/ledgerconnect/awesome-hive), list of services and apps on Hive.\n\nIf you don't know about Awesome project, take a look at here: https://project-awesome.org/\n\nProject contains list of services and links to various tools and libraries. Quite useful if you are developing or learning some new programming languages or skills. So we now have `awesome-hive` list, feel free to submit your pull request to add your apps, services. \n\nI will submit PR to project awesome in 30 days to list Hive in decentralized systems section. One of the requirements, awesome list should be around for more than 30 days. So I ask anyone with service, tools, dapps to submit pull request to https://github.com/ledgerconnect/awesome-hive so we have complete list of services by end of June.\n\nIn 30 days, we will PR to official project awesome list. More awareness about awesome Hive! Meanwhile, let's complete `awesome-hive` together! \ud83d\ude0e \ud83d\ude47 \ud83d\ude4f \n\n## Hive on!",
  json_metadata: {
    links: [
      "https://github.com/ledgerconnect/awesome-hive",
      "https://project-awesome.org/",
      "https://github.com/ledgerconnect/awesome-hive",
    ],
    image: ["https://images.esteem.app/DQmetNmv6rtcRxueXJSNm7ErLLKNYGJETxsNSoehn6xk9BC/awesome-hive.png"],
    tags: ["hive", "hiveio", "awesome", "devs", "development", "list"],
    app: "esteem/2.2.7-surfer",
    format: "markdown+html",
    community: "esteem.app",
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
      rshares: "34273117581576",
    },
    {
      voter: "user2",
      rshares: "2269348064337",
    },
    {
      voter: "user3",
      rshares: "19969726098",
    },
    {
      voter: "user4",
      rshares: "725359024516",
    },
    {
      voter: "user5",
      rshares: "24029616493",
    },
    {
      voter: "user6",
      rshares: "1485954337",
    },
    {
      voter: "user7",
      rshares: "1281560607198",
    },
    {
      voter: "user8",
      rshares: "554323413016",
    },
    {
      voter: "user9",
      rshares: "140063022903",
    },
    {
      voter: "user10",
      rshares: "542424211",
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
  percent_steem_dollars: 10000,
  url: "/hive/@good-karma/awesome-hive",
  blacklists: [],
};

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
