import React from "react";

import { createBrowserHistory } from "history";

import EntryMenu from "./index";

import TestRenderer from "react-test-renderer";

import { entryInstance1, globalInstance, dynamicPropsIntance1 } from "../../helper/test-helper";
import { withStore } from "../../tests/with-store";
import { queryClient } from "../../core";
import { QueryClientProvider } from "@tanstack/react-query";

const defProps = {
  history: createBrowserHistory(),
  global: globalInstance,
  dynamicProps: dynamicPropsIntance1,
  activeUser: null,
  entry: entryInstance1,
  communities: [],
  signingKey: "",
  setSigningKey: () => {},
  updateActiveUser: () => {},
  updateEntry: () => {},
  addCommunity: () => {},
  trackEntryPin: () => {},
  setEntryPin: () => {},
  toggleUIProp: () => {},
  addAccount: () => {}
};

it("(1) Default render", () => {
  const props = { ...defProps };
  const renderer = withStore(
    <QueryClientProvider client={queryClient}>
      <EntryMenu {...props} />
    </QueryClientProvider>
  );
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Separated sharing buttons", () => {
  const props = {
    ...defProps,
    separatedSharing: true
  };
  const renderer = withStore(
    <QueryClientProvider client={queryClient}>
      <EntryMenu {...props} />
    </QueryClientProvider>
  );
  expect(renderer.toJSON()).toMatchSnapshot();
});
