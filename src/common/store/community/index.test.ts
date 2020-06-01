import reducer, { initialState, fetchedAct, resetAct } from "./index";

import { State } from "./types";

let state: State | null = initialState;

it("1- default state", () => {
  expect(state).toMatchSnapshot();
});

it("1- fetched", () => {
  // @ts-ignore
  state = reducer(state, fetchedAct({ title: "bitcoin" }));
  expect(state).toMatchSnapshot();
});

it("2- reset", () => {
  state = reducer(state, resetAct());
  expect(state).toMatchSnapshot();
});

it("3- fetched", () => {
  // @ts-ignore
  state = reducer(state, fetchedAct({ title: "photography" }));
  expect(state).toMatchSnapshot();
});
