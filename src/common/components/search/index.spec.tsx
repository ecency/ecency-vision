import React from "react";

import { Search } from "./index";
import renderer from "react-test-renderer";
import { createBrowserHistory, createLocation } from "history";

import { initialState as trendingTags } from "../../store/trending-tags";
import { globalInstance } from "../../helper/test-helper";

const props = {
  history: createBrowserHistory(),
  location: createLocation({}),
  global: globalInstance,
  trendingTags,
  fetchTrendingTags: () => {}
};

const component = renderer.create(<Search {...props} />);

it("(1) Default render", () => {
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) With query", () => {
  const instance: any = component.getInstance();
  instance.setState({ query: "foo" });
  expect(component.toJSON()).toMatchSnapshot();
});
