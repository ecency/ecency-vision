import React from "react";
import renderer from "react-test-renderer";

import { createBrowserHistory } from "history";

import { StaticRouter } from "react-router-dom";

import { ProfileCommunities } from "./index";

import { globalInstance, activeUserMaker, allOver } from "../../helper/test-helper";

jest.mock("../../api/bridge", () => ({
  getSubscriptions: () =>
    new Promise((resolve) => {
      resolve([
        ["hive-125125", "Ecency", "admin", ""],
        ["hive-139531", "HiveDevs", "mod", ""],
        ["hive-102930", "Hive Improvement", "guest", ""]
      ]);
    }),
  getCommunity: () =>
    new Promise((resolve) => {
      resolve(null);
    })
}));

it("(1) Default render - With data.", async () => {
  const props = {
    history: createBrowserHistory(),
    global: globalInstance,
    activeUser: null,
    account: {
      name: "foo"
    }
  };

  const component = renderer.create(
    <StaticRouter location="/@username" context={{}}>
      <ProfileCommunities {...props} />
    </StaticRouter>
  );
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Should show create community link", async () => {
  const props = {
    history: createBrowserHistory(),
    global: globalInstance,
    activeUser: activeUserMaker("foo"),
    account: {
      name: "foo"
    }
  };

  const component = renderer.create(
    <StaticRouter location="/@username" context={{}}>
      <ProfileCommunities {...props} />
    </StaticRouter>
  );
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});
