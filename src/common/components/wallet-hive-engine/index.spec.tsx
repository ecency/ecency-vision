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
  getHiveEngineTokenBalances: () =>
    new Promise((resolve) => {
      if (MOCK_MODE === 1) {
        resolve([]);
      }

      if (MOCK_MODE === 2) {
        resolve([
          {
            symbol: "POB",
            name: "Proof of Brain",
            icon: "https://images.hive.blog/DQmebUEYTFmi2g4pqExAjaQrv9E9nzNtuEDbttRBRShkVYy/brain.png",
            precision: 8,
            stakingEnabled: true,
            delegationEnabled: true,
            undelegationCooldown: 7,
            balance: 0.0,
            stake: 8.10882833,
            stakedBalance: 8.10882833,
            delegationsIn: 0,
            delegationsOut: 0,
            pendingUndelegations: 0,
            hasDelegations: () => false,
            delegations: () => "",
            staked: () => "8.10882833",
            balanced: () => "0",
          },
          {
            symbol: "PIZZA",
            name: "PIZZA",
            icon: "https://cdn.discordapp.com/attachments/829112115822198805/853854448936812574/Hive3.png",
            precision: 2,
            stakingEnabled: true,
            delegationEnabled: false,
            balance: 1.0,
            stake: 0.11,
            stakedBalance: 1.13,
            delegationsIn: 1.12,
            delegationsOut: 0.1,
            hasDelegations: () => true,
            delegations: () => "(0.11 + 1.12 - 0.10)",
            staked: () => "1.13",
            balanced: () => "1.0",
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

it("(1) Render an empty list when no tokens found", async () => {
  const renderer = TestRenderer.create(
    <StaticRouter location="/" context={{}}>
      <Wallet {...defProps} />
    </StaticRouter>
  );
  await allOver();
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

it("(3) usePrivate = false", async () => {
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
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});
