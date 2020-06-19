import React from "react";

import Search from "./index";
import renderer from "react-test-renderer";
import { createBrowserHistory, createLocation } from "history";

import { communityInstance1 } from "../../helper/test-helper";

const props = {
  history: createBrowserHistory(),
  location: createLocation({}),
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
