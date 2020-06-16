import React from "react";

import { List } from "./index";

import renderer from "react-test-renderer";

import { createBrowserHistory } from "history";

jest.mock("../../constants/defaults.json", () => ({
  imageServer: "https://images.esteem.app",
}));

jest.mock("../../api/hive", () => () => ({
  getFollowers: () => [
    {
      follower: "foo",
      following: "user1",
      what: ["blog"],
    },
  ],
  getAccounts: () => [
    {
      name: "user1",
      profile: { name: "User One" },
    },
  ],
}));

const props = {
  history: createBrowserHistory(),
  account: { name: "foo" },
  addAccount: () => {},
};

const component = renderer.create(<List {...props} mode="follower" />);

it("(3) Default render of list", () => {
  expect(component.toJSON()).toMatchSnapshot();
});
