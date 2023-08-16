import React from "react";

import { Purchase } from "./index";

import {
  allOver,
  dynamicPropsIntance1,
  fullAccountInstance,
  globalInstance
} from "../../helper/test-helper";

import { initialState as transactionsInitialState } from "../../store/transactions/index";

import TestRenderer from "react-test-renderer";

jest.mock("../../api/private-api", () => ({
  calcPoints: () =>
    new Promise((resolve) => {
      resolve({ usd: 62.381282337, estm: 31190.6411685 });
    })
}));

const defProps = {
  global: globalInstance,
  dynamicProps: dynamicPropsIntance1,
  users: [],
  account: {
    name: "user1"
  },
  activeUser: {
    username: "foo",
    data: {
      ...fullAccountInstance,
      name: "foo",
      balance: "12.234 HIVE",
      hbd_balance: "4321.212",
      savings_balance: "2123.000 HIVE"
    },
    points: {
      points: "0.000",
      uPoints: "0.000"
    }
  },
  transactions: transactionsInitialState,
  signingKey: "",
  addAccount: () => {},
  updateActiveUser: () => {},
  setSigningKey: () => {},
  onHide: () => {},
  updateWalletValues: () => {}
};

it("(1) Purchase", async () => {
  const renderer = await TestRenderer.create(<Purchase {...defProps} />);
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Should switch to transfer", async () => {
  const component = await TestRenderer.create(<Purchase {...defProps} />);
  await allOver();
  const instance: any = component.getInstance();

  instance.setState({ submitted: true });
  expect(component.toJSON()).toMatchSnapshot();
});
