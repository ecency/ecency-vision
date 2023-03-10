import * as React from "react";
import renderer from "react-test-renderer";

import { createBrowserHistory, createLocation } from "history";

import { Schedules } from "./index";

import {
  globalInstance,
  activeUserInstance,
  fullAccountInstance,
  communityInstance1,
  allOver
} from "../../helper/test-helper";
import { withStore } from "../../tests/with-store";

let TEST_MODE = 0;

jest.mock("../../api/private-api", () => ({
  getSchedules: () =>
    new Promise((resolve) => {
      if (TEST_MODE === 0) {
        resolve([]);
      }

      if (TEST_MODE === 1) {
        resolve([
          {
            _id: "0f4cdce5-7fbe-467d-bdb4-0e600b108774",
            username: "foo",
            permlink: "eget-suscipit-quam-suspendisse",
            title: "Eget suscipit quam suspendisse",
            body: "Aliquam erat volutpat. Phasellus eget suscipit quam. Suspendisse et sapien ac tellus rhoncus pulvinar vitae id leo.",
            tags: "hive-125125 ecency",
            tags_arr: ["hive-125125", "ecency"],
            schedule: "2020-12-28T19:00:00+00:00",
            original_schedule: "2020-12-28T19:00:00+00:00",
            reblog: true,
            status: 1,
            message: null
          },
          {
            _id: "0f4cdce5-7fbe-467d-bdb4-0e600b108775",
            username: "foo",
            permlink: "eget-suscipit-quam-suspendisse",
            title: "Eget suscipit quam suspendisse",
            body: "Aliquam erat volutpat. Phasellus eget suscipit quam. Suspendisse et sapien ac tellus rhoncus pulvinar vitae id leo.",
            tags: "hive-125125 ecency",
            tags_arr: ["hive-125125", "ecency", "test"],
            schedule: "2020-11-28T19:00:00+00:00",
            original_schedule: "2020-11-28T19:00:00+00:00",
            reblog: false,
            status: 3,
            message: "tx0000000"
          },
          {
            _id: "0f4cdce5-7fbe-467d-bdb4-0e600b108776",
            username: "foo",
            permlink: "eget-suscipit-quam-suspendisse",
            title: "Eget suscipit quam suspendisse",
            body: "Aliquam erat volutpat. Phasellus eget suscipit quam. Suspendisse et sapien ac tellus rhoncus pulvinar vitae id leo.",
            tags: "hive-125125 ecency",
            tags_arr: ["hive-125125", "ecency", "test"],
            schedule: "2020-11-28T19:00:00+00:00",
            original_schedule: "2020-11-28T19:00:00+00:00",
            reblog: false,
            status: 2,
            message: "Rescheduled (Not enough RC)"
          },
          {
            _id: "0f4cdce5-7fbe-467d-bdb4-0e600b108777",
            username: "foo",
            permlink: "eget-suscipit-quam-suspendisse",
            title: "Eget suscipit quam suspendisse",
            body: "Aliquam erat volutpat. Phasellus eget suscipit quam. Suspendisse et sapien ac tellus rhoncus pulvinar vitae id leo.",
            tags: "hive-125125 ecency",
            tags_arr: ["hive-125125", "ecency", "test"],
            schedule: "2020-11-28T19:00:00+00:00",
            original_schedule: "2020-11-28T19:00:00+00:00",
            reblog: false,
            status: 4,
            message: "missing required posting authority"
          }
        ]);
      }
    })
}));

jest.mock("../../api/bridge", () => ({
  getCommunity: () =>
    new Promise((resolve) => {
      resolve(communityInstance1);
    })
}));

jest.mock("moment", () => () => ({
  fromNow: () => "3 days ago",
  format: (f: string, s: string) => "2020-01-01 23:12:00"
}));

const defProps = {
  history: createBrowserHistory(),
  location: createLocation({}),
  global: globalInstance,
  activeUser: {
    ...activeUserInstance,
    ...{ data: fullAccountInstance }
  },
  onHide: () => {}
};

it("(1) Empty list", async () => {
  const component = withStore(<Schedules {...defProps} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) With data", async () => {
  TEST_MODE = 1;

  const component = withStore(<Schedules {...defProps} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});
