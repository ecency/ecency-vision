import React from "react";
import Announcement from "./index";
import renderer from "react-test-renderer";

it("(1) Default render", () => {
  const component = renderer.create(<Announcement />);
  expect(component.toJSON()).toMatchSnapshot();
});
