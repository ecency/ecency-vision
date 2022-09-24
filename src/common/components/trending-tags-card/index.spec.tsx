import React from "react";

import TrendingTags from "./index";
import TestRenderer from "react-test-renderer";
import { createBrowserHistory } from "history";

import { EntryFilter } from "../../store/global/types";

import { activeUserInstance, globalInstance } from "../../helper/test-helper";

it("(1) Default render", () => {
  const props = {
    history: createBrowserHistory(),
    global: { ...globalInstance, ...{ tag: "", filter: EntryFilter.hot } },
    trendingTags: {
      list: ["art", "hive", "news"],
      loading: false,
      error: false,
    },
    activeUser: activeUserInstance
  };

  const renderer = TestRenderer.create(<TrendingTags {...props} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Selected tag", () => {
  const props = {
    history: createBrowserHistory(),
    global: { ...globalInstance, ...{ tag: "hive", filter: EntryFilter.hot } },
    trendingTags: {
      list: ["art", "hive", "news"],
      loading: false,
      error: false,
    },
    activeUser: null
  };

  const renderer = TestRenderer.create(<TrendingTags {...props} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});
