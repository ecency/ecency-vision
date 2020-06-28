import React from "react";

import EntryDeleteBtn from "./index";
import TestRenderer from "react-test-renderer";
import { createBrowserHistory } from "history";

import { entryInstance1 } from "../../helper/test-helper";

const defProps = {
  history: createBrowserHistory(),
  entry: { ...entryInstance1 },
  users: [],
  activeUser: null,
};

it("(1) Default render", () => {
  const props = { ...defProps };
  const renderer = TestRenderer.create(<EntryDeleteBtn {...props} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});
