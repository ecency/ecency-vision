import React from "react";

import { EntryReblogBtn } from "./index";

import TestRenderer from "react-test-renderer";

import {
  entryInstance1,
  UiInstance,
  emptyReblogs,
  activeUserMaker
} from "../../helper/test-helper";

const defProps = {
  entry: { ...entryInstance1 },
  users: [],
  activeUser: null,
  reblogs: emptyReblogs,
  ui: UiInstance,
  setActiveUser: () => {},
  updateActiveUser: () => {},
  deleteUser: () => {},
  fetchReblogs: () => {},
  addReblog: () => {},
  deleteReblog: () => {},
  toggleUIProp: () => {}
};

it("(1) No active user", () => {
  const props = { ...defProps };
  const renderer = TestRenderer.create(<EntryReblogBtn {...props} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Active user. Not reblogged", () => {
  const props = { ...defProps, activeUser: activeUserMaker("user1") };
  const renderer = TestRenderer.create(<EntryReblogBtn {...props} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(3) Active user. Reblogged", () => {
  const props = {
    ...defProps,
    activeUser: activeUserMaker("user1"),
    reblogs: {
      list: [
        { account: "user1", author: entryInstance1.author, permlink: entryInstance1.permlink }
      ],
      canFetch: false
    }
  };
  const renderer = TestRenderer.create(<EntryReblogBtn {...props} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(4) Reblogging", () => {
  const props = { ...defProps, activeUser: activeUserMaker("user1") };
  const component = TestRenderer.create(<EntryReblogBtn {...props} />);
  const instance: any = component.getInstance();
  instance.stateSet({ inProgress: true });
  expect(component.toJSON()).toMatchSnapshot();
});
