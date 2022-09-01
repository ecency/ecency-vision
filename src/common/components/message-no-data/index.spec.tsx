import React from "react";
import TestRenderer from "react-test-renderer";
import { globalInstance } from "../../helper/test-helper";
import MessageNoData from "./index";

const defProps = {
  buttonTo: "",
  buttonText: "",
  title: "",
  description: "",
  global: globalInstance
};

it("Renders a message", () => {
  const props = { ...defProps };
  const renderer = TestRenderer.create(<MessageNoData {...props} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});
