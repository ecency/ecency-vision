import reducer, { initialState, fetchAct, fetchedAct, fetchErrorAct, resetAct } from "./index";

import { Transaction } from "./types";

let state = initialState;

it("1- default state", () => {
  expect(state).toMatchSnapshot();
});

it("2- fetch", () => {
  state = reducer(state, fetchAct(""));
  expect(state).toMatchSnapshot();
});

it("3- fetch error", () => {
  state = reducer(state, fetchErrorAct());
  expect(state).toMatchSnapshot();
});

it("4- fetch", () => {
  state = reducer(state, fetchAct("transfers"));
  expect(state).toMatchSnapshot();
});

it("5- fetched", () => {
  const list: Transaction[] = [
    {
      trx_id: "0x123123",
      type: "curation_reward",
      comment_author: "user1",
      comment_permlink: "re-foo-qb4wuu",
      curator: "user2",
      num: 3204035,
      reward: "12061.044067 VESTS",
      timestamp: "2020-06-06T07:59:18",
    },
    {
      trx_id: "0x123124",
      amount: "43.101 HIVE",
      from: "user3",
      num: 3204009,
      timestamp: "2020-06-06T07:46:06",
      to: "user4",
      type: "transfer_to_vesting",
    },
  ];
  state = reducer(state, fetchedAct(list));
  expect(state).toMatchSnapshot();
});

it("6- reset", () => {
  state = reducer(state, resetAct());
  expect(state).toMatchSnapshot();
});
