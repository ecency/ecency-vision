import React from "react";

import TestRenderer from "react-test-renderer";
import { createBrowserHistory } from "history";
import { StaticRouter } from "react-router-dom";

import SelectedTags from "./index";

import { EntryFilter } from "../../store/global/types";

import { globalInstance } from "../../helper/test-helper";

it("(1) Default render", () => {
  const props = {
    history: createBrowserHistory(),
    global: { ...globalInstance, ...{ tag: "", filter: EntryFilter.hot } }
  };

  const renderer = TestRenderer.create(
    <StaticRouter location="/@username" context={{}}>
      <SelectedTags {...props} />
    </StaticRouter>
  );
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Selected tag", () => {
  const props = {
    history: createBrowserHistory(),
    global: { ...globalInstance, ...{ tag: "hive-174301", filter: EntryFilter.hot } }
  };

  const renderer = TestRenderer.create(
    <StaticRouter location="/@username" context={{}}>
      <SelectedTags {...props} />
    </StaticRouter>
  );
  expect(renderer.toJSON()).toMatchSnapshot();
});
