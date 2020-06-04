import reducer, { initialState, addAct } from "./index";

import { State } from "./types";

let state: State = [];

it("1- default state", () => {
  expect(state).toMatchSnapshot();
});

it("2- addAct - should add account", () => {
  state = reducer(state, addAct({ name: "user1" }));
  expect(state).toMatchSnapshot();
});

it("3- addAct - should add account", () => {
  state = reducer(state, addAct({ name: "user2" }));
  expect(state).toMatchSnapshot();
});

it("4- addAct - should update account", () => {
  state = reducer(state, addAct({ name: "user1", post_count: 10, __loaded: true }));
  expect(state).toMatchSnapshot();
});
