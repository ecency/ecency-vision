import React from "react";
import { createBrowserHistory } from "history";
import renderer from "react-test-renderer";

import CommunityCover from "./index";

import { Theme } from "../../store/global/types";
import { Account } from "../../store/accounts/types";

import {
  globalInstance,
  UiInstance,
  communityInstance1,
  fullAccountInstance
} from "../../helper/test-helper";

jest.mock("../../constants/defaults.json", () => ({
  imageServer: "https://images.ecency.com"
}));

jest.mock("../../api/hive", () => ({
  getFollowing: () =>
    new Promise((resolve) => {
      resolve([]);
    })
}));

const defProps = {
  history: createBrowserHistory(),
  global: { ...globalInstance },
  community: communityInstance1,
  users: [],
  activeUser: null,
  subscriptions: [],
  ui: UiInstance,
  setActiveUser: () => {},
  updateActiveUser: () => {},
  deleteUser: () => {},
  toggleUIProp: () => {},
  updateSubscriptions: () => {},
  addAccount: () => {},
  resetChat: () => {}
};

it("(1) Render with loaded account object", () => {
  const account: Account = {
    ...fullAccountInstance,
    name: "user1",
    profile: {
      cover_image: "https://img.esteem.app/rwd380.jpg"
    }
  };

  const props = {
    ...defProps,
    account
  };

  const component = renderer.create(<CommunityCover {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Render with not loaded account object", () => {
  const account: Account = {
    name: "user1"
  };

  const props = {
    ...defProps,
    account
  };

  const component = renderer.create(<CommunityCover {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(3) No bg image - Day theme", () => {
  const account: Account = {
    ...fullAccountInstance,
    name: "user1",
    profile: {}
  };

  const props = {
    ...defProps,
    account
  };

  const component = renderer.create(<CommunityCover {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(4) No bg image - Night theme", () => {
  const account: Account = {
    ...fullAccountInstance,
    name: "user1",
    profile: {}
  };

  const props = {
    ...defProps,
    global: { ...globalInstance, ...{ theme: Theme.night } },
    account
  };

  const component = renderer.create(<CommunityCover {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});
