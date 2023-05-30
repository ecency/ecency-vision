import React from "react";

import Discussion from "./index";

import { Discussion as DiscussionType, SortOrder } from "../../store/discussion/types";

import { create, act } from "react-test-renderer";

import { createBrowserHistory, createLocation } from "history";

import {
  globalInstance,
  discussionInstace1,
  dynamicPropsIntance1,
  activeUserMaker,
  communityInstance1,
  UiInstance,
  allOver
} from "../../helper/test-helper";
import { withStore } from "../../tests/with-store";

jest.mock("moment", () => () => ({
  fromNow: () => "3 days ago",
  format: (f: string, s: string) => "2020-01-01 23:12:00"
}));

const [parent] = discussionInstace1;
const [, ...replies] = discussionInstace1;

const discussion: DiscussionType = {
  list: replies,
  loading: false,
  error: false,
  order: SortOrder.trending
};

const defProps = {
  history: createBrowserHistory(),
  location: createLocation({}),
  global: globalInstance,
  dynamicProps: dynamicPropsIntance1,
  users: [],
  activeUser: activeUserMaker("foo"),
  ui: UiInstance,
  parent,
  community: null,
  isRawContent: false,
  discussion,
  addAccount: () => {},
  setActiveUser: () => {},
  updateActiveUser: () => {},
  deleteUser: () => {},
  fetchDiscussion: () => {},
  sortDiscussion: () => {},
  resetDiscussion: () => {},
  updateReply: () => {},
  addReply: () => {},
  deleteReply: () => {},
  toggleUIProp: () => {},
  hideControls: false
};

it("(1) Full render with active user", async () => {
  // render the component
  let component = await withStore(<Discussion {...defProps} />);
  await allOver();
  // make assertions on component
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Full render with no active user", async () => {
  const props = {
    ...defProps,
    activeUser: null
  };
  // render the component
  let component = await withStore(<Discussion {...props} />);
  await allOver();
  // make assertions on component
  expect(component.toJSON()).toMatchSnapshot();
});

it("(3) With selected item", async () => {
  const props = {
    ...defProps,
    location: createLocation({ hash: "#@forykw/re-esteemapp-202067t12246786z" })
  };
  // render the component
  let component = await withStore(<Discussion {...props} />);
  await allOver();
  // make assertions on component
  expect(component.toJSON()).toMatchSnapshot();
});

it("(4) Show mute button, muted comment", async () => {
  let [reply] = replies;
  reply = { ...reply, stats: { hide: false, gray: true, total_votes: 180, flag_weight: 0 } };

  const discussion: DiscussionType = {
    list: [reply, replies[1]],
    loading: false,
    error: false,
    order: SortOrder.trending
  };

  const nProps = {
    ...defProps,
    discussion,
    activeUser: activeUserMaker("hive-148441"),
    community: communityInstance1
  };

  // render the component
  const component = await withStore(<Discussion {...nProps} />);
  await allOver();
  // make assertions on component
  expect(component.toJSON()).toMatchSnapshot();
});
