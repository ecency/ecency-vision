import reducer, { initialState, loginAct, logoutAct, updateAct } from "./index";

import { fullAccountInstance } from "../../helper/test-helper";

jest.mock("../../util/local-storage", () => ({
  get: (k: string) => {
    if (k === "active_user") {
      return "foo";
    }

    if (k.startsWith("user_")) {
      return "....";
    }

    return null;
  }
}));

let state = initialState;

it("1- default state", () => {
  expect(state).toMatchSnapshot();
});

it("2- loginAct", () => {
  state = reducer(state, loginAct());
  expect(state).toMatchSnapshot();
});

it("3- updateAct", () => {
  state = reducer(
    state,
    updateAct({ ...fullAccountInstance, name: "foo" }, { points: "0.100", uPoints: "0.200" })
  );
  expect(state).toMatchSnapshot();
});
