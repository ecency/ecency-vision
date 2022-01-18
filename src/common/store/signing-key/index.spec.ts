import reducer, { initialState, setAct } from "./index";

import { loginAct } from "../active-user";

let state = initialState;

it("1- default state", () => {
  expect(state).toMatchSnapshot();
});

it("2- Set Act", () => {
  state = reducer(state, setAct("swcdwedk23e21dwedewfckoefp"));
  expect(state).toMatchSnapshot();
});

it("3- loginAct", () => {
  state = reducer(state, loginAct());
  expect(state).toMatchSnapshot();
});
