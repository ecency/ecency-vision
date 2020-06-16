import React from "react";

import Discussion from "./index";

import renderer from "react-test-renderer";

import { createBrowserHistory } from "history";

import { globalInstance, discussionInstace1 } from "../../helper/test-helper";

jest.mock("../../api/bridge", () => ({
  getDiscussion: () =>
    new Promise((resolve) => {
      resolve([]);
    }),
}));
const [parent] = discussionInstace1;

const props = {
  history: createBrowserHistory(),
  global: globalInstance,
  parent: { ...parent, children: 0 },
  addAccount: () => {},
};

const component = renderer.create(<Discussion {...props} />);

it("(1) Empty list", () => {
  expect(component.toJSON()).toMatchSnapshot();
});
