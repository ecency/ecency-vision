import reducer, { initialState, addAct } from "./index";

import { communityInstance1 } from "../../helper/test-helper";

let state = initialState;

it("1- default state", () => {
  expect(state).toMatchSnapshot();
});

it("2- addAct", () => {
  state = reducer(state, addAct(communityInstance1));
  expect(state).toMatchSnapshot();
});
