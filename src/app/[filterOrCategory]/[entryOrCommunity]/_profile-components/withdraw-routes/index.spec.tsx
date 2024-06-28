import React from "react";

import { WithdrawRoutes } from "./index";

import { globalInstance, fullAccountInstance, allOver } from "../../helper/test-helper";

import TestRenderer from "react-test-renderer";

let MOCK_MODE = 1;

jest.mock("../../api/hive", () => ({
  getWithdrawRoutes: () =>
    new Promise((resolve) => {
      if (MOCK_MODE === 1) {
        resolve([]);
      }

      if (MOCK_MODE === 2) {
        resolve([
          {
            auto_vest: true,
            from_account: "foo",
            id: 11,
            percent: 2400,
            to_account: "bar"
          },
          {
            auto_vest: false,
            from_account: "foo",
            id: 12,
            percent: 3800,
            to_account: "baz"
          }
        ]);
      }
    })
}));

const defProps = {
  global: globalInstance,
  activeUser: {
    username: "foo",
    data: {
      ...fullAccountInstance,
      name: "foo"
    },
    points: {
      points: "10.000",
      uPoints: "0.000"
    }
  },
  signingKey: "",
  setSigningKey: () => {},
  onHide: () => {}
};

it("(1) Default render", async () => {
  const component = TestRenderer.create(<WithdrawRoutes {...defProps} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) With table", async () => {
  MOCK_MODE = 2;

  const component = TestRenderer.create(<WithdrawRoutes {...defProps} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});
