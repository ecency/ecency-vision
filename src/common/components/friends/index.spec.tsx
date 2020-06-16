import React from "react";

import { List } from "./index";
import renderer from "react-test-renderer";
import { createBrowserHistory } from "history";

import { entryInstance1, dynamicPropsIntance1 } from "../../helper/test-helper";

jest.mock("../../constants/defaults.json", () => ({
  imageServer: "https://images.esteem.app",
}));

const props = {
  history: createBrowserHistory(),
  account: { name: "foo" },
  addAccount: () => {},
};

const component = renderer.create(<List {...props}  mode="follower"/>);

it("(3) Default render of list", () => {
  expect(component.toJSON()).toMatchSnapshot();
});
