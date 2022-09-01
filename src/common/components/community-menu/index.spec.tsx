import React from "react";

import { StaticRouter } from "react-router-dom";

import { createLocation, createBrowserHistory } from "history";

import CommunityMenu from "./index";
import TestRenderer from "react-test-renderer";

import { globalInstance, communityInstance1 } from "../../helper/test-helper";

const defProps = {
  history: createBrowserHistory(),
  location: createLocation({}),
  global: { ...globalInstance },
  community: { ...communityInstance1 },
  toggleListStyle: () => {}
};

it("(1) Default render", () => {
  const props = {
    ...defProps,
    ...{
      match: {
        path: "...",
        url: "/trending/hive-125125",
        isExact: true,
        params: { filter: "trending", name: "hive-125125" }
      }
    }
  };

  const comp = <CommunityMenu {...props} />;

  const renderer = TestRenderer.create(
    <StaticRouter location="/trending/hive-125125" context={{}}>
      {comp}
    </StaticRouter>
  );

  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Hot filter", () => {
  const props = {
    ...defProps,
    ...{
      match: {
        path: "...",
        url: "/hot/hive-125125",
        isExact: true,
        params: { filter: "hot", name: "hive-125125" }
      }
    }
  };

  const comp = <CommunityMenu {...props} />;

  const renderer = TestRenderer.create(
    <StaticRouter location="/hot/hive-125125" context={{}}>
      {comp}
    </StaticRouter>
  );

  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(3) In section", () => {
  const props = {
    ...defProps,
    ...{
      match: {
        path: "...",
        url: "/activities/hive-125125",
        isExact: true,
        params: { filter: "hot", name: "hive-125125" }
      }
    }
  };

  const comp = <CommunityMenu {...props} />;

  const renderer = TestRenderer.create(
    <StaticRouter location="/hot/hive-125125/activities" context={{}}>
      {comp}
    </StaticRouter>
  );

  expect(renderer.toJSON()).toMatchSnapshot();
});
