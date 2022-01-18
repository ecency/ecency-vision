import reducer, { initialState, fetchAct, fetchedAct, fetchErrorAct, resetAct } from "./index";

let state = initialState;

import { entryInstance1 } from "../../helper/test-helper";
import { Entry } from "../entries/types";

it("1- default state", () => {
  expect(state).toMatchSnapshot();
});

it("2- fetch", () => {
  state = reducer(state, fetchAct());
  expect(state).toMatchSnapshot();
});

it("3- fetch error", () => {
  state = reducer(state, fetchErrorAct());
  expect(state).toMatchSnapshot();
});

it("4- fetch", () => {
  state = reducer(state, fetchAct());
  expect(state).toMatchSnapshot();
});

it("5- fetched", () => {
  const list = [entryInstance1];
  state = reducer(state, fetchedAct(list));
  expect(state).toMatchSnapshot();
});

it("6- reset", () => {
  state = reducer(state, resetAct());
  expect(state).toMatchSnapshot();
});
