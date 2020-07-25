import React from "react";

import { List } from "./index";
import renderer from "react-test-renderer";
import { createBrowserHistory } from "history";

import { entryInstance1, dynamicPropsIntance1, delegatedVestingInstance } from "../../helper/test-helper";

jest.mock("../../constants/defaults.json", () => ({
  imageServer: "https://images.ecency.com/webp",
}));

jest.mock("../../api/hive", () => ({
  getVestingDelegations: () =>
    new Promise((resolve) => {
      resolve(delegatedVestingInstance);
    }),
}));

const detailProps = {
  history: createBrowserHistory(),
  account: { name: "foo" },
  dynamicProps: dynamicPropsIntance1,
  entry: { ...entryInstance1 },
  addAccount: () => {},
};

const component = renderer.create(<List {...detailProps} />);

it("(1) Full render", () => {
  expect(component.toJSON()).toMatchSnapshot();
});
