import reducer, { initialState, addAct } from "./index";

import { State } from "./types";

let state: State = [];

it("1- default state", () => {
  expect(state).toMatchSnapshot();
});

it("2- addAct", () => {
  // @ts-ignore
  state = reducer(state, addAct({ id: 12 }));
  expect(state).toMatchSnapshot();
});

it("3- addAct", () => {
  // @ts-ignore
  state = reducer(state, addAct({ id: 13 }));
  expect(state).toMatchSnapshot();
});
