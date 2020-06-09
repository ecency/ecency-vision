import React from "react";

import { List } from "./index";

import TestRenderer from "react-test-renderer";

import { createBrowserHistory } from "history";

import { globalInstance, discussionInstace1 } from "../../helper/test-helper";

import sortDiscussion, { SortOrder } from "../../helper/discussion-sort";

jest.mock("moment", () => () => ({
  fromNow: () => "3 days ago",
  format: (f: string, s: string) => "2020-01-01 23:12:00",
}));

it("(1) Render List", () => {
  sortDiscussion(discussionInstace1, SortOrder.trending);

  const [parent] = discussionInstace1;
  const [, ...replies] = discussionInstace1;
  const props = {
    history: createBrowserHistory(),
    global: globalInstance,
    discussion: replies,
    parent,
    addAccount: () => {},
  };
  const renderer = TestRenderer.create(<List {...props} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});
