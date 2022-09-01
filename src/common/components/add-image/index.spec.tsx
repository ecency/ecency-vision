import React from "react";

import { AddImage } from "./index";

import TestRenderer from "react-test-renderer";

it("(1) Default render", async () => {
  const props = {
    onHide: () => {},
    onSubmit: () => {}
  };

  const renderer = TestRenderer.create(<AddImage {...props} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});
