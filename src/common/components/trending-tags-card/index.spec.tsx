import React from "react";

import TrendingTags from "./index";
import TestRenderer from "react-test-renderer";
import { createBrowserHistory } from "history";

import { Filter } from "../../store/global/types";

import { globalInstance } from "../../helper/test-helper";

it("(1) Default render", () => {
  const props = {
    history: createBrowserHistory(),
    global: { ...globalInstance, ...{ tag: "", filter: Filter.hot } },
    trendingTags: {
      list: ["art", "hive", "news"],
      loading: false,
      error: false,
    },
  };

  const renderer = TestRenderer.create(<TrendingTags {...props} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Selected tag", () => {
  const props = {
    history: createBrowserHistory(),
    global: { ...globalInstance, ...{ tag: "hive", filter: Filter.hot } },
    trendingTags: {
      list: ["art", "hive", "news"],
      loading: false,
      error: false,
    },
  };

  const renderer = TestRenderer.create(<TrendingTags {...props} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});
