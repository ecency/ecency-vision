import React from "react";
import renderer from "react-test-renderer";

import { createBrowserHistory } from "history";

import { StaticRouter } from "react-router-dom";

import { ProfileReferrals } from "./index";

import { allOver, dynamicPropsIntance1, globalInstance } from "../../helper/test-helper";
import { initialState as transactionsInitialState } from "../../store/transactions/index";

jest.mock("../../api/bridge", () => ({
  getReferrals: () =>
    new Promise((resolve) => {
      resolve([
        {
          id: 25623,
          referral: "seckorama",
          username: "kaazoom",
          rewarded: 1,
          created: "2022-05-30T22:10:01.495694+02:00"
        },
        {
          id: 18777,
          referral: "seckorama",
          username: "esencyvik",
          rewarded: 0,
          created: "2022-01-07T16:39:19.535457+01:00"
        },
        {
          id: 17283,
          referral: "seckorama",
          username: "miljo76",
          rewarded: 1,
          created: "2021-12-02T18:04:15.557536+01:00"
        },
        {
          id: 13203,
          referral: "seckorama",
          username: "mahsan64",
          rewarded: 0,
          created: "2021-08-15T19:40:53.959337+02:00"
        },
        {
          id: 3006,
          referral: "seckorama",
          username: "huaweichcu",
          rewarded: 0,
          created: "2021-01-15T13:19:19.716093+01:00"
        },
        {
          id: 2967,
          referral: "seckorama",
          username: "christian12",
          rewarded: 0,
          created: "2021-01-14T15:12:26.912838+01:00"
        }
      ]);
    }),
  getReferralsStats: () =>
    new Promise((resolve) => {
      resolve({
        total: 6,
        rewarded: 2
      });
    })
}));

it("(1) Default render - With data.", async () => {
  const props = {
    history: createBrowserHistory(),
    global: globalInstance,
    dynamicProps: dynamicPropsIntance1,
    activeUser: null,
    account: {
      name: "foo"
    },
    transactions: transactionsInitialState,
    signingKey: "",
    addAccount: () => {},
    updateActiveUser: () => {},
    setSigningKey: () => {},
    fetchTransactions: () => {},
    updateWalletValues: () => {}
  };

  const component = renderer.create(
    <StaticRouter location="/@username" context={{}}>
      <ProfileReferrals {...props} />
    </StaticRouter>
  );
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});
