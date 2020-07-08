import React from "react";

import Discussion from "./index";

import renderer from "react-test-renderer";

import { createBrowserHistory } from "history";

import { globalInstance, discussionInstace1, dynamicPropsIntance1 } from "../../helper/test-helper";

jest.mock("moment", () => () => ({
  fromNow: () => "3 days ago",
  format: (f: string, s: string) => "2020-01-01 23:12:00",
}));

jest.mock("../../api/bridge", () => ({
  getDiscussion: () =>
    new Promise((resolve) => {
      const [, ...replies] = discussionInstace1;
      resolve(replies);
    }),
}));

const [parent] = discussionInstace1;

const props = {
  history: createBrowserHistory(),
  global: globalInstance,
  dynamicProps: dynamicPropsIntance1,
  users: [],
  activeUser: null,
  parent,
  addAccount: () => {},
};

const component = renderer.create(<Discussion {...props} />);

it("(1) Full render", () => {
  expect(component.toJSON()).toMatchSnapshot();
});
