import React from "react";

import renderer from "react-test-renderer";

import { createBrowserHistory } from "history";

import { Subscribers } from "./index";

import {
  globalInstance,
  communityInstance1,
  activeUserMaker,
  allOver
} from "../../helper/test-helper";
import { withStore } from "../../tests/with-store";

jest.mock("../../api/bridge", () => ({
  getSubscribers: () =>
    new Promise((resolve) => {
      resolve([
        ["foo", "guest", null, "2020-09-09 04:37:54"],
        ["bar", "guest", null, "2020-09-09 04:37:54"],
        ["baz", "guest", null, "2020-09-09 04:37:54"],
        ["lorem", "guest", null, "2020-09-09 04:37:54"],
        ["ipsum", "guest", null, "2020-09-09 04:37:54"],
        ["dolor", "guest", null, "2020-09-09 04:37:54"]
      ]);
    })
}));

jest.mock("../../api/hive", () => ({
  getAccounts: () =>
    new Promise((resolve) => {
      resolve([
        { name: "bluemist", reputation: 74.1 },
        { name: "foo", reputation: 70.8 },
        { name: "bar", reputation: 65.2 },
        { name: "baz", reputation: 68.9 },
        { name: "lorem", reputation: 51.6 },
        { name: "ipsum", reputation: 75.5 },
        { name: "dolor", reputation: 42.4 }
      ]);
    })
}));

const defProps = {
  history: createBrowserHistory(),
  global: globalInstance,
  community: { ...communityInstance1 },
  activeUser: null,
  addAccount: () => {},
  addCommunity: () => {}
};

it("(1) Default render.", async () => {
  const component = await withStore(<Subscribers {...defProps} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Active user.", async () => {
  const props = {
    ...defProps,
    activeUser: activeUserMaker("bluemist")
  };
  const component = await withStore(<Subscribers {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});
