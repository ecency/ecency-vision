import React from "react";

import { StaticRouter } from "react-router-dom";
import TestRenderer from "react-test-renderer";
import { createBrowserHistory } from "history";

import { EntryIndexMenuDropdown } from "./index";

import { activeUserInstance, globalInstance } from "../../helper/test-helper";

const defaultProps = {
  history: createBrowserHistory(),
  global: globalInstance,
  onChangeGlobal: () => {},
  isGlobal: true,
  toggleUIProp: () => {},
  isActive: true,
  activeUser: activeUserInstance,
  noReblog: false,
  handleFilterReblog: () => {}
};

it("(1) Renders correctly for global true and active true", () => {
  const renderer = TestRenderer.create(
    <StaticRouter location="/" context={{}}>
      <EntryIndexMenuDropdown {...defaultProps} />
    </StaticRouter>
  );
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Renders correctly for global false and active false", () => {
  const renderer = TestRenderer.create(
    <StaticRouter location="/" context={{}}>
      <EntryIndexMenuDropdown {...defaultProps} isGlobal={false} isActive={false} />
    </StaticRouter>
  );
  expect(renderer.toJSON()).toMatchSnapshot();
});
