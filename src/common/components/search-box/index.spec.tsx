import React from "react";

import SearchBox from "./index";

import TestRenderer from "react-test-renderer";

it("(1) Default Render", () => {
  const props = {};
  const renderer = TestRenderer.create(<SearchBox {...props} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});
