import React from "react";

import Wallet from "./index";

import TestRenderer from "react-test-renderer";

import { createBrowserHistory } from "history";

import { initialState as transactionsInitialState } from "../../store/transactions/index";

import {
  globalInstance,
  dynamicPropsIntance1,
  fullAccountInstance,
  allOver,
} from "../../helper/test-helper";
import { StaticRouter } from "react-router-dom";
import { FullAccount } from "../../store/accounts/types";

let MOCK_MODE = 1;

jest.mock("../../api/hive-engine", () => ({
  getTokenBalances: () =>
    new Promise((resolve) => {
      if (MOCK_MODE === 1) {
        resolve([]);
      }

      if (MOCK_MODE === 2) {
        resolve([
          {
            _id: 265634,
            account: "user1",
            symbol: "POB",
            balance: "0.00000000",
            stake: "8.10882833",
            pendingUnstake: "0.00000000",
            delegationsIn: "0",
            delegationsOut: "0",
            pendingUndelegations: "0",
          },
          {
            _id: 298167,
            account: "user1",
            symbol: "PIZZA",
            balance: "1.00",
            stake: "0.10",
            pendingUnstake: "0",
            delegationsIn: "0",
            delegationsOut: "0",
            pendingUndelegations: "0",
          },
        ]);
      }
    }),
}));

const account: FullAccount = {
  ...fullAccountInstance,
  name: "user1",
};

const defProps = {
  history: createBrowserHistory(),
  global: globalInstance,
  dynamicProps: dynamicPropsIntance1,
  users: [],
  activeUser: null,
  account,
};

it("(1) Render an empty list when no tokens found", () => {
  const renderer = TestRenderer.create(
    <StaticRouter location="/" context={{}}>
      <Wallet {...defProps} />
    </StaticRouter>
  );
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Render with some hive engine tokens", async () => {
  MOCK_MODE = 2;

  const renderer = TestRenderer.create(
    <StaticRouter location="/" context={{}}>
      <Wallet {...defProps} />
    </StaticRouter>
  );
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(3) usePrivate = false", () => {
  const props = {
    ...defProps,
    global: {
      ...globalInstance,
      usePrivate: false,
    },
  };
  const renderer = TestRenderer.create(
    <StaticRouter location="/" context={{}}>
      <Wallet {...props} />
    </StaticRouter>
  );
  expect(renderer.toJSON()).toMatchSnapshot();
});
