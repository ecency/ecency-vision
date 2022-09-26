import * as React from "react";
import renderer from "react-test-renderer";

import { createBrowserHistory, createLocation } from "history";

import { Drafts } from "./index";

import {
  globalInstance,
  activeUserInstance,
  fullAccountInstance,
  communityInstance1,
  allOver
} from "../../helper/test-helper";

let TEST_MODE = 0;

jest.mock("../../api/bridge", () => ({
  getCommunity: () =>
    new Promise((resolve) => {
      resolve(communityInstance1);
    })
}));

jest.mock("../../api/private-api", () => ({
  getDrafts: () =>
    new Promise((resolve) => {
      if (TEST_MODE === 0) {
        resolve([]);
      }

      if (TEST_MODE === 1) {
        resolve([
          {
            title: "Nam quis enim laoreet",
            body: "Vivamus vel lorem ut metus lacinia pharetra. ",
            created: "Mon Aug 10 2020 17:39:16 GMT+0200 (Central European Summer Time)",
            tags: "hive-184437 ecency",
            _id: "5f316a24baede01c77aa15fc",
            post_type: null,
            timestamp: 1597073956580
          },
          {
            title: "Nam vel tincidunt ante, in mattis velit",
            body: "Lorem ipsum dolor sit amet",
            created: "Tue Aug 11 2020 08:59:43 GMT+0200 (Central European Summer Time)",
            tags: "ecency",
            _id: "5f3241dfbaede01c77aa1674",
            post_type: null,
            timestamp: 1597129183659
          },
          {
            title: "Aliquam luctus egestas enim",
            body: "Quis rhoncus dui scelerisque sit amet.\n",
            created: "Tue Aug 11 2020 09:57:22 GMT+0200 (Central European Summer Time)",
            tags: "photofeed ecency",
            _id: "5f324f62baede01c77aa168a",
            post_type: null,
            timestamp: 1597132642791
          }
        ]);
      }
    })
}));

jest.mock("moment", () => () => ({
  fromNow: () => "3 days ago",
  format: (f: string, s: string) => "2020-01-01 23:12:00"
}));

const activeUser = { ...activeUserInstance, data: fullAccountInstance };

it("(1) Default render.", async () => {
  const props = {
    history: createBrowserHistory(),
    location: createLocation({}),
    global: globalInstance,
    activeUser: { ...activeUser },
    onHide: () => {}
  };

  const component = await renderer.create(<Drafts {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Test with data.", async () => {
  TEST_MODE = 1;

  const props = {
    history: createBrowserHistory(),
    location: createLocation({}),
    global: globalInstance,
    activeUser: { ...activeUser },
    onHide: () => {}
  };

  const component = renderer.create(<Drafts {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});
