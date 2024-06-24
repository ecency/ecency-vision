import React from "react";

import TestRenderer from "react-test-renderer";

import { globalInstance, communityInstance1, allOver } from "../../helper/test-helper";
import { createBrowserHistory, createLocation } from "history";
import { StaticRouter } from "react-router-dom";

import { SearchCommunities } from "./index";
import { withStore } from "../../tests/with-store";

let TEST_MODE = 0;

jest.mock("../../api/bridge", () => ({
  getCommunities: () =>
    new Promise((resolve) => {
      if (TEST_MODE === 0) {
        resolve([communityInstance1]);
      }

      if (TEST_MODE === 1) {
        resolve([]);
      }
    })
}));

const defProps = {
  history: createBrowserHistory(),
  location: createLocation({ search: "q=foo" }),
  global: globalInstance
};

it("(1) Default render", async () => {
  const props = { ...defProps };

  const renderer = withStore(
    <StaticRouter location="/" context={{}}>
      <SearchCommunities {...props} />
    </StaticRouter>
  );
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) No matches", async () => {
  TEST_MODE = 1;
  const props = { ...defProps };

  const renderer = withStore(
    <StaticRouter location="/" context={{}}>
      <SearchCommunities {...props} />
    </StaticRouter>
  );
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});
