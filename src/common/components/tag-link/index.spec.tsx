import React from "react";

import TagLink from "./index";
import TestRenderer from "react-test-renderer";
import { createBrowserHistory } from "history";

import { globalInstance } from "../../helper/test-helper";

import { EntryFilter } from "../../store/global/types";

jest.mock("../../api/bridge", () => ({
  getCommunity: () =>
    new Promise((resolve) => {
      resolve(null);
    }),
}));

it("(1) Default render", () => {
  const props = {
    history: createBrowserHistory(),
    global: {
      ...globalInstance,
      ...{
        filter: EntryFilter.hot,
        tag: "bitcoin",
      },
    },
    tag: "bitcoin",
  };

  const renderer = TestRenderer.create(
    <TagLink {...props}>
      <span>bitcoin</span>
    </TagLink>
  );
  expect(renderer.toJSON()).toMatchSnapshot();
});