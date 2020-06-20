import React from "react";

import Tag from "./index";
import TestRenderer from "react-test-renderer";
import { createBrowserHistory } from "history";

import { globalInstance, communityInstance1 } from "../../helper/test-helper";

import { EntryFilter } from "../../store/global/types";

jest.mock("../../api/bridge", () => ({
  getCommunity: () =>
    new Promise((resolve) => {
      resolve(communityInstance1);
    }),
}));

it("(1) Link", () => {
  const props = {
    history: createBrowserHistory(),
    global: {
      ...globalInstance,
      ...{
        filter: EntryFilter.hot,
        tag: "bitcoin",
      },
    },
    tag: "bitcoin"
  };

  const renderer = TestRenderer.create(
    <Tag {...props} type="link">
      <span>bitcoin</span>
    </Tag>
  );
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Span", () => {
  const props = {
    history: createBrowserHistory(),
    global: {
      ...globalInstance,
      ...{
        filter: EntryFilter.hot,
        tag: "bitcoin",
      },
    },
    tag: "bitcoin"
  };

  const renderer = TestRenderer.create(
    <Tag {...props} type="span">
      <span>bitcoin</span>
    </Tag>
  );
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(3) Community as Link", () => {
  const props = {
    history: createBrowserHistory(),
    global: {
      ...globalInstance,
      ...{
        filter: EntryFilter.hot,
        tag: "bitcoin",
      },
    },
    tag: "hive-2321"
  };

  const renderer = TestRenderer.create(
    <Tag {...props} type="span">
      <span>hive-2321</span>
    </Tag>
  );
  expect(renderer.toJSON()).toMatchSnapshot();
});