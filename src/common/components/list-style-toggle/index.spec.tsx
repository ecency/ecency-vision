import React from "react";

import ListStyleToggle from "./index";

import { ListStyle } from "../../store/global/types";

import TestRenderer from "react-test-renderer";

import { globalInstance } from "../../helper/test-helper";

it("(1) Default", () => {
  const props = {
    global: globalInstance,
    toggleListStyle: () => {},
  };
  const renderer = TestRenderer.create(<ListStyleToggle {...props} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Toggled", () => {
  const props = {
    global: { ...globalInstance, listStyle: ListStyle.grid },
    toggleListStyle: () => {},
  };
  const renderer = TestRenderer.create(<ListStyleToggle {...props} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});
