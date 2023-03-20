import React from "react";
import { act } from "react-dom/test-utils";

import WalletHiveEngineDetail from "./index";

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
import HiveEngineToken, {
  HiveEngineTokenEntryDelta,
  isUndefined
} from "../../helper/hive-engine-wallet";
import { FullAccount } from "../../store/accounts/types";

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
  clearToken: () => {},
  openTransferDialog: () => {},
  closeTransferDialog: () => {},
  modifyTokenValues: () => {},
  tokenName: "POB",
  hiveEngineToken: new HiveEngineToken({
    symbol: "POB",
    name: "Proof of Brain",
    icon: "https://images.hive.blog/DQmebUEYTFmi2g4pqExAjaQrv9E9nzNtuEDbttRBRShkVYy/brain.png",
    precision: 8,
    stakingEnabled: true,
    delegationEnabled: true,
    balance: "0.0",
    stake: "8.10882833",
    delegationsIn: "0",
    delegationsOut: "0"
  }),
  delegationList: []
};
