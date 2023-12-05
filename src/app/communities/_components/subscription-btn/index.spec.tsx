import React from "react";

import SubscriptionBtn from "./index";
import renderer from "react-test-renderer";

import { communityInstance1, UiInstance } from "../../helper/test-helper";

const defProps = {
  users: [],
  activeUser: null,
  community: { ...communityInstance1 },
  ui: UiInstance,
  subscriptions: [],
  setActiveUser: () => {},
  updateActiveUser: () => {},
  deleteUser: () => {},
  toggleUIProp: () => {},
  updateSubscriptions: () => {}
};

it("(1) Default render", () => {
  const props = { ...defProps };
  const component = renderer.create(<SubscriptionBtn {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Subscribed", () => {
  const props = {
    ...defProps,
    subscriptions: [["hive-148441", "GEMS", "quest"]]
  };
  const component = renderer.create(<SubscriptionBtn {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(3) With button props", () => {
  const props = {
    ...defProps,
    subscriptions: [["hive-148441", "GEMS", "quest"]]
  };
  const component = renderer.create(<SubscriptionBtn {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});
