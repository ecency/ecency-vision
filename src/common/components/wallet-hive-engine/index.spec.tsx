import React from "react";

import WalletHiveEngine from "./index";

import TestRenderer from "react-test-renderer";

import { initialState as transactionsInitialState } from "../../store/transactions/index";
import { createBrowserHistory } from "history";
import {
  globalInstance,
  dynamicPropsIntance1,
  activeUserInstance,
  allOver,
  fullAccountInstance
} from "../../helper/test-helper";
import { StaticRouter } from "react-router-dom";
import { FullAccount } from "../../store/accounts/types";

let MOCK_MODE = 1;

jest.mock("../../api/hive-engine", () => ({
  getTokenDelegations: () =>
    new Promise((resolve) => {
      resolve([]);
    }),
  getHiveEngineTokenBalances: () =>
    new Promise((resolve) => {
      if (MOCK_MODE === 1) {
        resolve([]);
      }

      if (MOCK_MODE === 2 || MOCK_MODE === 3) {
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
            balanced: () => "0"
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
            balanced: () => "1.0"
          }
        ]);
      }

      if (MOCK_MODE === 4) {
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
            stake: 0,
            stakedBalance: 0,
            delegationsIn: 0,
            delegationsOut: 0,
            pendingUndelegations: 0,
            hasDelegations: () => false,
            delegations: () => "",
            staked: () => "0",
            balanced: () => "0"
          }
        ]);
      }
    }),
  getMetrics: () =>
    new Promise((resolve) => {
      if (MOCK_MODE === 1 || MOCK_MODE === 2 || MOCK_MODE === 3 || MOCK_MODE === 4) {
        resolve([]);
      }
    }),
  getUnclaimedRewards: () =>
    new Promise((resolve) => {
      if (MOCK_MODE === 1 || MOCK_MODE === 2 || MOCK_MODE === 4) {
        resolve([]);
      }

      if (MOCK_MODE === 3) {
        resolve([
          {
            pending_token: 883586,
            precision: 8,
            symbol: "POB"
          }
        ]);
      }
    })
}));

const account: FullAccount = {
  ...fullAccountInstance,
  name: "user1"
};

const defProps = {
  history: createBrowserHistory(),
  global: globalInstance,
  dynamicProps: dynamicPropsIntance1,
  activeUser: { ...activeUserInstance },
  account,
  transactions: transactionsInitialState,
  signingKey: "",
  addAccount: () => {},
  updateActiveUser: () => {},
  setSigningKey: () => {},
  fetchPoints: () => {},
  updateWalletValues: () => {},
  transferAsset: null
};

it("(1) Render an empty list when no tokens found", async () => {
  const props = {
    ...defProps,
    global: {
      ...globalInstance,
      isMobile: true
    }
  };
  const renderer = await TestRenderer.create(
    <StaticRouter location="/" context={{}}>
      <WalletHiveEngine {...props} />
    </StaticRouter>
  );
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Render with some hive engine tokens", async () => {
  MOCK_MODE = 2;
  const props = {
    ...defProps,
    global: {
      ...globalInstance,
      isMobile: true
    }
  };
  const renderer = await TestRenderer.create(
    <StaticRouter location="/" context={{}}>
      <WalletHiveEngine {...props} />
    </StaticRouter>
  );
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(3) Render with an unclaimed rewards", async () => {
  MOCK_MODE = 3;
  const props = {
    ...defProps,
    global: {
      ...globalInstance,
      isMobile: true
    }
  };
  const renderer = await TestRenderer.create(
    <StaticRouter location="/" context={{}}>
      <WalletHiveEngine {...props} />
    </StaticRouter>
  );
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(4) Render an empty list if tokens equals zero", async () => {
  MOCK_MODE = 4;
  const props = {
    ...defProps,
    global: {
      ...globalInstance,
      isMobile: true
    }
  };
  const renderer = await TestRenderer.create(
    <StaticRouter location="/" context={{}}>
      <WalletHiveEngine {...props} />
    </StaticRouter>
  );
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(5) usePrivate = false", async () => {
  const props = {
    ...defProps,
    global: {
      ...globalInstance,
      usePrivate: false,
      isMobile: true
    }
  };
  const renderer = await TestRenderer.create(
    <StaticRouter location="/" context={{}}>
      <WalletHiveEngine {...props} />
    </StaticRouter>
  );
  //await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});
