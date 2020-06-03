import React from "react";

import ProfileCard from "./index";
import renderer from "react-test-renderer";

jest.mock("../../constants/defaults.json", () => ({
  imageServer: "https://images.esteem.app",
}));

const account = {
  active: {
    account_auths: [],
    key_auths: [["STM71z4rmzGHdp7pmePZyS1G2GrbuBqg9PPHRgiK6uYqjzUTRNCRR", 1]],
    weight_threshold: 1,
  },
  balance: "2.598 HIVE",
  can_vote: true,
  comment_count: 0,
  created: "2018-01-29T20:10:06",
  curation_rewards: 53,
  delegated_vesting_shares: "0.000000 VESTS",
  downvote_manabar: { current_mana: "16874750664", last_update_time: 1589888058 },
  guest_bloggers: [],
  id: 689709,
  json_metadata:
    '{"profile":{"name":"Talha B.","about":"Founder @runkod, Software Developer @esteemapp, Lifelong Learner","cover_image":"https://img.esteem.app/rwd380.jpg","profile_image":"https://img.esteem.app/821e0q.jpg","website":"https://github.com/talhasch","location":"Istanbul"},"escrow":{"fees":{"STEEM":"1.000","SBD":"3.000"},"terms":"lorem ipsum dolor sit amet"}}',
  last_account_recovery: "1970-01-01T00:00:00",
  last_account_update: "2020-05-25T17:00:24",
  last_owner_update: "1970-01-01T00:00:00",
  last_post: "2020-04-28T07:05:27",
  last_root_post: "2020-04-28T07:04:18",
  last_vote_time: "2020-03-31T07:11:57",
  lifetime_vote_count: 0,
  market_history: [],
  memo_key: "STM7rioGL7NopT2Zo446hnzAiHLp5sJ1gS55xu3NikmxfQnEznsue",
  mined: false,
  name: "talhasch",
  next_vesting_withdrawal: "1969-12-31T23:59:59",
  other_history: [],
  owner: {
    account_auths: [],
    key_auths: [["STM7F7zfd6ieangxz6uxQkYifUS5H841x5E41SYZaVc9F9cGPJ9jN", 1]],
    weight_threshold: 1,
  },
  pending_claimed_accounts: 0,
  post_bandwidth: 0,
  post_count: 212,
  post_history: [],
  posting: {
    account_auths: [
      ["busy.app", 1],
      ["drugwars.app", 1],
      ["esteem-app", 1],
      ["esteem.app", 1],
      ["esteemapp", 1],
    ],
    key_auths: [["STM6uvU7j624wCZNa2pcXvkqmbnNC1cgraDrVG3pFRhXvj9LYS7Xp", 1]],
    weight_threshold: 1,
  },
  posting_json_metadata:
    '{"profile":{"profile_image":"https://scontent-lht6-1.xx.fbcdn.net/v/t1.0-1/p320x320/12241236_10153810817671310_7266508310252207215_n.jpg?oh=1fa175937c9c76910e106f443264a2a1&oe=5B491036","name":"Talha B.","location":"Istanbul","website":"https://github.com/talhasch","cover_image":"","about":""},"escrow":{"fees":{"STEEM":"1.000","SBD":"3.000"},"terms":"lorem ipsum dolor sit amet"}}',
  posting_rewards: 1859,
  proxied_vsf_votes: [0, 0, 0, 0],
  proxy: "",
  received_vesting_shares: "0.000000 VESTS",
  recovery_account: "steem",
  reputation: "33082349040",
  reset_account: "null",
  reward_sbd_balance: "0.000 HBD",
  reward_steem_balance: "0.000 HIVE",
  reward_vesting_balance: "0.000000 VESTS",
  reward_vesting_steem: "0.000 HIVE",
  savings_balance: "0.000 HIVE",
  savings_sbd_balance: "0.000 HBD",
  savings_sbd_last_interest_payment: "2019-01-09T15:17:45",
  savings_sbd_seconds: "0",
  savings_sbd_seconds_last_update: "2019-01-09T15:17:45",
  savings_withdraw_requests: 0,
  sbd_balance: "0.006 HBD",
  sbd_last_interest_payment: "2019-12-19T11:16:00",
  sbd_seconds: "0",
  sbd_seconds_last_update: "2020-04-02T08:48:39",
  tags_usage: [],
  to_withdraw: "87017000000",
  transfer_history: [],
  vesting_balance: "0.000 HIVE",
  vesting_shares: "67499.002656 VESTS",
  vesting_withdraw_rate: "0.000000 VESTS",
  vote_history: [],
  voting_manabar: { current_mana: "67499002656", last_update_time: 1589888058 },
  voting_power: 0,
  withdraw_routes: 1,
  withdrawn: "87017000000",
  witness_votes: [
    "aggroed",
    "anyx",
    "ausbitbank",
    "blocktrades",
    "emrebeyler",
    "good-karma",
    "gtg",
    "roelandp",
    "someguy123",
    "steempeak",
    "themarkymark",
    "therealwolf",
    "yabapmatt",
  ],
  witnesses_voted_for: 13,
  profile: {
    name: "Talha B.",
    about: "Founder @runkod, Software Developer @esteemapp, Lifelong Learner",
    cover_image: "https://img.esteem.app/rwd380.jpg",
    profile_image: "https://img.esteem.app/821e0q.jpg",
    website: "https://github.com/talhasch",
    location: "Istanbul",
  },
  follow_stats: { account: "talhasch", follower_count: 210, following_count: 29 },
};

it("(1) Default render", () => {
  const props = {
    account,
  };

  //@ts-ignore
  const component = renderer.create(<ProfileCard {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});
