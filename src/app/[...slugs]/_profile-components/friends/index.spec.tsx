import React from "react";

import { List } from "./index";

import renderer from "react-test-renderer";

import { createBrowserHistory } from "history";

import { globalInstance } from "../../helper/test-helper";
import { withStore } from "../../tests/with-store";

jest.mock("../../constants/defaults.json", () => ({
  imageServer: "https://images.ecency.com"
}));

jest.mock("../../api/hive", () => ({
  getFollowers: () =>
    new Promise((resolve) => {
      resolve([
        {
          follower: "foo",
          following: "user1",
          what: ["blog"]
        },
        {
          follower: "bar",
          following: "user2",
          what: ["blog"]
        },
        {
          follower: "baz",
          following: "user3",
          what: ["blog"]
        }
      ]);
    }),
  getAccounts: () =>
    new Promise((resolve) => {
      resolve([
        {
          name: "user1",
          profile: { name: "User One" }
        },
        {
          name: "user2",
          profile: { name: "User Two" }
        },
        {
          name: "user3",
          profile: { name: "User Three" }
        }
      ]);
    })
}));

const props = {
  global: globalInstance,
  history: createBrowserHistory(),
  account: { name: "foo" },
  addAccount: () => {}
};

const component = withStore(<List {...props} mode="follower" />);

it("(1) Render list", () => {
  expect(component.toJSON()).toMatchSnapshot();
});
