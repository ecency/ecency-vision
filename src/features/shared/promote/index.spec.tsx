import React from "react";

import { Promote } from "./index";

import TestRenderer from "react-test-renderer";

import { globalInstance, entryInstance1, allOver } from "../../helper/test-helper";

jest.mock("../../api/private-api", () => ({
  getPromotePrice: () =>
    new Promise((resolve) => {
      resolve([
        { price: 150, duration: 1 },
        { price: 250, duration: 2 },
        { price: 350, duration: 3 },
        { price: 500, duration: 7 },
        { price: 1000, duration: 14 }
      ]);
    })
}));

it("(1) Default render", async () => {
  const props = {
    global: globalInstance,
    activeUser: {
      username: "foo",
      data: {
        name: "foo",
        balance: "12.234 HIVE",
        hbd_balance: "4321.212",
        savings_balance: "2123.000 HIVE"
      },
      points: {
        points: "500.000",
        uPoints: "0.000"
      }
    },
    signingKey: "",
    updateActiveUser: () => {},
    setSigningKey: () => {},
    onHide: () => {}
  };

  const renderer = TestRenderer.create(<Promote {...props} />);
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Insufficient Funds", async () => {
  const props = {
    global: globalInstance,
    activeUser: {
      username: "foo",
      data: {
        name: "foo",
        balance: "12.234 HIVE",
        hbd_balance: "4321.212",
        savings_balance: "2123.000 HIVE"
      },
      points: {
        points: "10.000",
        uPoints: "0.000"
      }
    },
    signingKey: "",
    updateActiveUser: () => {},
    setSigningKey: () => {},
    onHide: () => {}
  };

  const renderer = TestRenderer.create(<Promote {...props} />);
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(3) With entry", async () => {
  const props = {
    global: globalInstance,
    activeUser: {
      username: "foo",
      data: {
        name: "foo",
        balance: "12.234 HIVE",
        hbd_balance: "4321.212",
        savings_balance: "2123.000 HIVE"
      },
      points: {
        points: "500.000",
        uPoints: "0.000"
      }
    },
    signingKey: "",
    entry: entryInstance1,
    updateActiveUser: () => {},
    setSigningKey: () => {},
    onHide: () => {}
  };

  const renderer = TestRenderer.create(<Promote {...props} />);
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});
