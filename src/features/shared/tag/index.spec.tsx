import React from "react";

import Tag from "./index";
import TestRenderer from "react-test-renderer";
import { createBrowserHistory } from "history";

import { globalInstance, communityInstance1 } from "../../helper/test-helper";

import { EntryFilter, AllFilter } from "../../store/global/types";

jest.mock("../../api/bridge", () => ({
  getCommunity: () =>
    new Promise((resolve) => {
      resolve(communityInstance1);
    })
}));

it("(1) Link", () => {
  const props = {
    history: createBrowserHistory(),
    global: {
      ...globalInstance,
      ...{
        filter: EntryFilter.hot,
        tag: "bitcoin"
      }
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
        tag: "bitcoin"
      }
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
        tag: "bitcoin"
      }
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

it("(4) Should use default filter if the globl filter is 'feed'", () => {
  const props = {
    history: createBrowserHistory(),
    global: {
      ...globalInstance,
      ...{
        filter: AllFilter.feed,
        tag: "bitcoin"
      }
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

it("(5) Link with community tag", () => {
  const props = {
    history: createBrowserHistory(),
    global: {
      ...globalInstance
    },
    tag: { name: "hive-125125", title: "Ecency" }
  };

  const renderer = TestRenderer.create(
    <Tag {...props} type="link">
      <span>Ecency</span>
    </Tag>
  );
  expect(renderer.toJSON()).toMatchSnapshot();
});
