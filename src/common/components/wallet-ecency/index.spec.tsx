import React from "react";

import { StaticRouter } from "react-router-dom";

import { createBrowserHistory } from "history";

import { formatMemo, WalletEcency } from "./index";

import { initialState as transactionsInitialState } from "../../store/transactions/index";

import {
  activeUserMaker,
  allOver,
  dynamicPropsIntance1,
  globalInstance,
  pointTransactionsInstance
} from "../../helper/test-helper";
import { withStore } from "../../tests/with-store";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../../core";

jest.mock("moment", () => () => ({
  fromNow: () => "5 days ago"
}));

const defProps = {
  history: createBrowserHistory(),
  global: globalInstance,
  dynamicProps: dynamicPropsIntance1,
  activeUser: null,
  account: {
    name: "user1"
  },
  points: {
    points: "12.010",
    uPoints: "0.000",
    transactions: [...pointTransactionsInstance],
    loading: false,
    filter: 0
  },
  signingKey: "",
  transactions: transactionsInitialState,
  addAccount: () => {},
  updateActiveUser: () => {},
  updateWalletValues: () => {},
  setSigningKey: () => {}
};

it("(1) Default Render", async () => {
  const props = {
    ...defProps
  };

  const container = withStore(
    <QueryClientProvider client={queryClient}>
      <StaticRouter location="/" context={{}}>
        <WalletEcency {...props} />
      </StaticRouter>
    </QueryClientProvider>
  );
  await allOver();
  expect(container.toJSON()).toMatchSnapshot();
});

it("(2) With active user", async () => {
  const props = {
    ...defProps,
    activeUser: activeUserMaker("user1")
  };
  const container = withStore(
    <QueryClientProvider client={queryClient}>
      <StaticRouter location="/" context={{}}>
        <WalletEcency {...props} />
      </StaticRouter>
    </QueryClientProvider>
  );
  await allOver();
  expect(container.toJSON()).toMatchSnapshot();
});

it("(3) Active user with unclaimed points", async () => {
  const props = {
    ...defProps,
    activeUser: activeUserMaker("user1"),
    points: {
      points: "12.010",
      uPoints: "6.200",
      transactions: [...pointTransactionsInstance],
      loading: false,
      filter: 0
    }
  };
  const container = withStore(
    <QueryClientProvider client={queryClient}>
      <StaticRouter location="/" context={{}}>
        <WalletEcency {...props} />
      </StaticRouter>
    </QueryClientProvider>
  );
  await allOver();
  expect(container.toJSON()).toMatchSnapshot();
});

it("(4) Format memo", () => {
  const history = createBrowserHistory();

  expect(formatMemo("", history)).toMatchSnapshot();

  expect(formatMemo("transfer", history)).toMatchSnapshot();

  expect(formatMemo("thank you!", history)).toMatchSnapshot();

  expect(formatMemo("Promotion price for foo/bar", history)).toMatchSnapshot();

  expect(formatMemo("Refund for foo/bar", history)).toMatchSnapshot();

  expect(formatMemo("Community reward for @foo/bar", history)).toMatchSnapshot();

  expect(formatMemo("lorem foo/bar ipsum", history)).toMatchSnapshot();
});

it("(5) usePrivate = false", async () => {
  const props = {
    ...defProps,
    global: {
      ...globalInstance,
      usePrivate: false
    }
  };
  const container = withStore(
    <QueryClientProvider client={queryClient}>
      <StaticRouter location="/" context={{}}>
        <WalletEcency {...props} />
      </StaticRouter>
    </QueryClientProvider>
  );
  await allOver();
  expect(container.toJSON()).toMatchSnapshot();
});
