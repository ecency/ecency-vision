import React from "react";

import { createBrowserHistory } from "history";

import { WitnessesActiveProxy } from "./index";

import renderer from "react-test-renderer";

import { globalInstance, UiInstance, fullAccountInstance, allOver } from "../../helper/test-helper";

jest.mock("../../api/hive", () => ({
  getAccount: () =>
    new Promise((resolve) => {
      resolve(fullAccountInstance);
    })
}));

const defProps = {
  history: createBrowserHistory(),
  global: globalInstance,
  users: [],
  activeUser: null,
  ui: UiInstance,
  signingKey: "",
  setActiveUser: () => {},
  updateActiveUser: () => {},
  deleteUser: () => {},
  addAccount: () => {},
  toggleUIProp: () => {},
  setSigningKey: () => {},
  username: "foo",
  onDone: () => {}
};

it("(1) Default render", async () => {
  const component = renderer.create(<WitnessesActiveProxy {...defProps} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});
