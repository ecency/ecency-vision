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
            issuer: "proofofbrainio",
            name: "Proof of Brain",
            url: "https://proofofbrain.io",
            icon: "https://images.hive.blog/DQmebUEYTFmi2g4pqExAjaQrv9E9nzNtuEDbttRBRShkVYy/brain.png",
            desc: "POB is a pure 100% Proof of Brain (PoB) token meaning that the only way the token enters circulation is through PoB rewards that are earned by posting and by curating content with POB staked. 1 token has been issued to @proofofbrainio to enable staking. There will be no more POB tokens issued except through PoB rewards. Like Bitcoin mining, rewards decrease by 50% every 4 years.\\n\\nThere are no proof of mining or proof of stake rewards. There will be no tokens issued to a founder or a team. There is a 10% beneficiary percentage when posting on proofofbrain.io. Funds from the beneficiary rewards will be used to maintain proofofbrain.io.",
            precision: 8,
            maxSupply: 21000000.0,
            supply: 1230891.23605666,
            circulatingSupply: 1226775.98180137,
            stakingEnabled: true,
            unstakingCooldown: 28,
            delegationEnabled: true,
            undelegationCooldown: 7,
            numberTransactions: 4,
            totalStaked: 1109006.24137294,
            balance: 0.0,
            stake: 8.10882833,
            stakedBalance: 8.10882833,
            pendingUnstake: 0.0,
            delegationsIn: 0,
            delegationsOut: 0,
            pendingUndelegations: 0,
            hasDelegations: () => false,
            delegations: () => ""
          },
          {
            symbol: "PIZZA",
            issuer: "pizzaexpress",
            name: "PIZZA",
            url: "https://www.hive.pizza",
            icon: "https://cdn.discordapp.com/attachments/829112115822198805/853854448936812574/Hive3.png",
            desc: "Add liquidity to our PIZZA Diesel Pools to farm rewards daily. Win token rewards just by holding $PIZZA! Buy and hold 20 $PIZZA and gain access to the !PIZZA command to reward others with free $PIZZA!  Spend $PIZZA on Steam Video Games in the $PIZZA Game Store! Delegate HP to our @hive.pizza curation account to farm tokens daily and much much more!",
            precision: 2,
            maxSupply: 100000000.0,
            supply: 1121000.0,
            circulatingSupply: 403380.6,
            stakingEnabled: true,
            unstakingCooldown: 28,
            delegationEnabled: false,
            undelegationCooldown: 0,
            numberTransactions: 4,
            totalStaked: 248673.89,
            balance: 1.0,
            stake: 0.11,
            stakedBalance: 1.13,
            pendingUnstake: 0,
            delegationsIn: 1.12,
            delegationsOut: 0.1,
            pendingUndelegations: 0,
            hasDelegations: () => true,
            delegations: () => "(0.11 + 1.12 - 0.10)"
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
  account
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
