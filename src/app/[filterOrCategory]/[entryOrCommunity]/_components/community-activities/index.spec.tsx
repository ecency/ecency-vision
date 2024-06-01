import React from "react";
import renderer from "react-test-renderer";

import { createBrowserHistory } from "history";

import { Activities } from "./index";

import { globalInstance, communityInstance1, allOver } from "../../helper/test-helper";

jest.mock("moment", () => () => ({
  fromNow: () => "3 days ago"
}));

jest.mock("../../api/bridge", () => ({
  getAccountNotifications: () =>
    new Promise((resolve) => {
      resolve([
        {
          date: "2020-09-09T04:49:00",
          id: 82401222,
          msg: "@foo pin @foo/bar-permlink",
          score: 35,
          type: "pin_post",
          url: "@foo/bar-permlink"
        },
        {
          date: "2020-09-08T12:57:57",
          id: 82366223,
          msg: "@foo set @bar member",
          score: 35,
          type: "set_role",
          url: "trending/hive-183952"
        },
        {
          date: "2020-09-08T12:53:36",
          id: 82366013,
          msg: "@foo unpin @foo/bar-permlink",
          score: 35,
          type: "unpin_post",
          url: "@foo/bar-permlink"
        },
        {
          date: "2020-09-08T02:38:57",
          id: 82345318,
          msg: "@foo subscribed to Bar",
          score: 35,
          type: "subscribe",
          url: "trending/hive-125125"
        }
      ]);
    })
}));

it("(1) Default render - With data.", async () => {
  const props = {
    history: createBrowserHistory(),
    global: globalInstance,
    community: { ...communityInstance1 },
    addAccount: () => {}
  };

  const component = await renderer.create(<Activities {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});
