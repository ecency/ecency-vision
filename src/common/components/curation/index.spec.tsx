import React from "react";
import { create, act } from "react-test-renderer";
import { createBrowserHistory } from "history";

import { globalInstance, allOver, dynamicPropsIntance1 } from "../../helper/test-helper";

import { Curation } from "./index";
import { withStore } from "../../tests/with-store";

jest.mock("../../api/private-api", () => ({
  getCuration: (duration: string) =>
    new Promise((resolve) => {
      resolve([
        { account: "foo", votes: 42, vests: "121.325" },
        { account: "bar", votes: 40, vests: "60.040" },
        { account: "baz", votes: 26, vests: "44.707" },
        { account: "zoo", votes: 22, vests: "55.040" }
      ]);
    }),
  getAccounts: (accounts: string[]) =>
    new Promise((resolve) => {
      resolve([]);
    })
}));

it("(1) Render with data.", async () => {
  const props = {
    global: globalInstance,
    history: createBrowserHistory(),
    dynamicProps: dynamicPropsIntance1,
    addAccount: () => {}
  };

  // render the component
  const root = await withStore(<Curation {...props} />);
  // make assertions on root
  await allOver();
  expect(root.toJSON()).toMatchSnapshot();
});
