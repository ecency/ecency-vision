import reducer, { initialState, toggleLoginAct, toggleNotificationsAct } from "./index";

let state = initialState;

it("1- default state", () => {
  expect(state).toMatchSnapshot();
});

it("2- toggleLoginAct", () => {
  state = reducer(state, toggleLoginAct());
  expect(state).toMatchSnapshot();
});

it("4- toggleLoginAct", () => {
  state = reducer(state, toggleLoginAct());
  expect(state).toMatchSnapshot();
});

it("5- toggleNotificationsAct", () => {
  state = reducer(state, toggleNotificationsAct());
  expect(state).toMatchSnapshot();
});
