import React from "react";

import TrendingTags from "./index";
import TestRenderer from "react-test-renderer";
import { createBrowserHistory } from "history";

it("(1) Default render", () => {
  const props = {
    history: createBrowserHistory(),
    global: {
      tag: "",
      filter: "hot",
    },
    trendingTags: {
      list: ["art", "hive", "news"],
    },
  };

  // @ts-ignore
  const renderer = TestRenderer.create(<TrendingTags {...props} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Selected tag", () => {
  const props = {
    history: createBrowserHistory(),
    global: {
      tag: "hive",
      filter: "hot",
    },
    trendingTags: {
      list: ["art", "hive", "news"],
    },
  };

  // @ts-ignore
  const renderer = TestRenderer.create(<TrendingTags {...props} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});
