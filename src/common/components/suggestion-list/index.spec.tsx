import React from "react";

import SuggestionList from "./index";

import renderer from "react-test-renderer";

const props = {
  items: ["foo", "bar", "baz"],
  // header: "My List",
  // renderer: (i: any) => <> {`# ${i}`}</>,
  modeItems: [
    {
      items: ["foo", "bar", "baz"],
      header: "My List",
      renderer: (i: any) => <> {`# ${i}`}</>
    }
  ]
};

const component = renderer.create(
  <SuggestionList {...props}>
    <span>children</span>
  </SuggestionList>
);

it("(1) Default render", () => {
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Show list", () => {
  const instance: any = component.getInstance();
  instance.setState({ showList: true });
  expect(component.toJSON()).toMatchSnapshot();
});
