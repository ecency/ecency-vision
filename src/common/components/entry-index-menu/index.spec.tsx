import React from "react";

import { StaticRouter } from "react-router-dom";
import TestRenderer from "react-test-renderer";
import { createBrowserHistory } from "history";

import { EntryIndexMenu } from "./index";

import { globalInstance, activeUserMaker } from "../../helper/test-helper";

import { EntryFilter, AllFilter } from "../../store/global/types";

const defaultProps = {
  history: createBrowserHistory(),
  global: globalInstance,
  activeUser: null,
  toggleListStyle: () => {},
  toggleUIProp: () => {}
};

it("(1) No active user. Default filter", () => {
  const renderer = TestRenderer.create(
    <StaticRouter location="/" context={{}}>
      <EntryIndexMenu {...defaultProps} />
    </StaticRouter>
  );
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) No active user. Trending filter", () => {
  const props = {
    ...defaultProps,
    global: {
      ...globalInstance,
      filter: EntryFilter.trending
    }
  };

  const renderer = TestRenderer.create(
    <StaticRouter location="/" context={{}}>
      <EntryIndexMenu {...props} />
    </StaticRouter>
  );
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(3) Active user. Trending filter", () => {
  const props = {
    ...defaultProps,
    global: {
      ...globalInstance,
      filter: EntryFilter.trending
    },
    activeUser: activeUserMaker("foo")
  };

  const renderer = TestRenderer.create(
    <StaticRouter location="/" context={{}}>
      <EntryIndexMenu {...props} />
    </StaticRouter>
  );
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(4) Active user. Friends", () => {
  const props = {
    ...defaultProps,
    global: {
      ...globalInstance,
      filter: AllFilter.feed,
      tag: "@foo"
    },
    activeUser: activeUserMaker("foo")
  };

  const renderer = TestRenderer.create(
    <StaticRouter location="/" context={{}}>
      <EntryIndexMenu {...props} />
    </StaticRouter>
  );
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(5) Active user. Communities", () => {
  const props = {
    ...defaultProps,
    global: {
      ...globalInstance,
      filter: AllFilter.trending,
      tag: "my"
    },
    activeUser: activeUserMaker("foo")
  };

  const renderer = TestRenderer.create(
    <StaticRouter location="/" context={{}}>
      <EntryIndexMenu {...props} />
    </StaticRouter>
  );
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(6) No active user. Communities", () => {
  const props = {
    ...defaultProps,
    global: {
      ...globalInstance,
      filter: AllFilter.trending,
      tag: "my"
    },
    activeUser: null
  };

  const renderer = TestRenderer.create(
    <StaticRouter location="/" context={{}}>
      <EntryIndexMenu {...props} />
    </StaticRouter>
  );
  expect(renderer.toJSON()).toMatchSnapshot();
});
