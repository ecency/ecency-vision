import React from "react";

import { List } from "./index";
import renderer from "react-test-renderer";
import { createBrowserHistory } from "history";

import { dynamicPropsIntance1, receivedVestingInstance } from "../../helper/test-helper";

jest.mock("../../constants/defaults.json", () => ({
  imageServer: "https://images.ecency.com",
}));

jest.mock("../../api/private", () => ({
  getReceivedVestingShares: () =>
    new Promise((resolve) => {
      resolve(receivedVestingInstance);
    }),
}));

const detailProps = {
  history: createBrowserHistory(),
  account: { name: "foo" },
  dynamicProps: dynamicPropsIntance1,
  addAccount: () => {},
};

const component = renderer.create(<List {...detailProps} />);

it("(1) Full render", () => {
  expect(component.toJSON()).toMatchSnapshot();
});
