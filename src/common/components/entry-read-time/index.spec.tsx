import React from "react";
import { ReadTime } from "./index";
import renderer from "react-test-renderer";
import { entryInstance1, globalInstance } from "../../helper/test-helper";

const props = {
  global: globalInstance,
  entry: entryInstance1,
  isVisible: true,
  toolTip: false
};

const component = renderer.create(<ReadTime {...props} />);

it("(1) Default render", () => {
  expect(component.toJSON()).toMatchSnapshot();
});
