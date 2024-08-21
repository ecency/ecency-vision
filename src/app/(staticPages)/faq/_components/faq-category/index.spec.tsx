import React from "react";
import FaqCategory from "./index";
import renderer from "react-test-renderer";

it("(1) Default render", () => {
  const props = {
    categoryTitle: "",
    contentList: []
  };
  const component = renderer.create(<FaqCategory {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});
