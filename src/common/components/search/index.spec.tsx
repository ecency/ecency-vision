import React from "react";

import Search from "./index";
import renderer from "react-test-renderer";
import { createBrowserHistory } from "history";

import { communityInstance1 } from "../../helper/test-helper";

const props = {
  history: createBrowserHistory(),
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

it("(3) With account suggestions", () => {
  const instance: any = component.getInstance();
  instance.setState({ query: "@foo", mode: "account", hasFocus: true, suggestions: ["@foo", "@foox"] });
  expect(component.toJSON()).toMatchSnapshot();
});

it("(4) With tag suggestions", () => {
  const instance: any = component.getInstance();
  instance.setState({ query: "#foo", mode: "tag", hasFocus: true, suggestions: ["#foo", "#foox"] });
  expect(component.toJSON()).toMatchSnapshot();
});

it("(5) With community suggestions", () => {
  const instance: any = component.getInstance();
  instance.setState({ query: "$foo", mode: "comm", hasFocus: true, suggestions: [communityInstance1] });
  expect(component.toJSON()).toMatchSnapshot();
});
