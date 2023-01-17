import React from "react";
import FloatingFAQ from "./index";
import renderer from "react-test-renderer";

const component = renderer.create(<FloatingFAQ />);

it("(1) Default render", () => {
  expect(component.toJSON()).toMatchSnapshot();
});
