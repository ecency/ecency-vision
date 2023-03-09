import React from "react";

import { List } from "./index";
import renderer from "react-test-renderer";
import { createBrowserHistory } from "history";

import {
  entryInstance1,
  dynamicPropsIntance1,
  delegatedVestingInstance,
  globalInstance,
  activeUserMaker,
  allOver
} from "../../helper/test-helper";
import { withStore } from "../../tests/with-store";

jest.mock("../../constants/defaults.json", () => ({
  imageServer: "https://images.ecency.com"
}));

let MOCK_MODE = 1;

jest.mock("../../api/hive", () => ({
  getVestingDelegations: () =>
    new Promise((resolve) => {
      if (MOCK_MODE === 1) {
        resolve(delegatedVestingInstance);
      }

      if (MOCK_MODE === 2) {
        resolve([]);
      }
    })
}));

const defaultProps = {
  global: globalInstance,
  history: createBrowserHistory(),
  activeUser: null,
  account: { name: "foo" },
  dynamicProps: dynamicPropsIntance1,
  signingKey: "",
  entry: { ...entryInstance1 },
  totalDelegated: "",
  addAccount: () => {},
  setSigningKey: () => {},
  onHide: () => {}
};

it("(1) Default render", async () => {
  const component = withStore(<List {...defaultProps} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) With active user", async () => {
  const props = {
    ...defaultProps,
    activeUser: activeUserMaker("bar")
  };
  const component = withStore(<List {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(3) With delegator active user", async () => {
  const props = {
    ...defaultProps,
    activeUser: activeUserMaker("foo")
  };
  const component = withStore(<List {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(4) Empty List", async () => {
  MOCK_MODE = 2;
  const component = withStore(<List {...defaultProps} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});
