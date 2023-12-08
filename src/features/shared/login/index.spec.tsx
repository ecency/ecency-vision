import React from "react";

import renderer from "react-test-renderer";

import { createBrowserHistory } from "history";

import { Login } from "./index";

import { globalInstance, activeUserMaker } from "../../helper/test-helper";
import { withStore } from "../../tests/with-store";

const defProps = {
  history: createBrowserHistory(),
  global: globalInstance,
  users: [],
  activeUser: null,
  setActiveUser: () => {},
  addUser: () => {},
  deleteUser: () => {},
  toggleUIProp: () => {},
  doLogin: async () => {}
};

it("(1) Default render", () => {
  const component = renderer.create(<Login {...defProps} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) With users", () => {
  const users = [
    {
      username: "user1",
      accessToken: "aa",
      refreshToken: "bb",
      expiresIn: 2,
      postingKey: null
    },
    {
      username: "user2",
      accessToken: "aa",
      refreshToken: "bb",
      expiresIn: 2,
      postingKey: null
    }
  ];

  const props = { ...defProps, users };

  const component = withStore(<Login {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(3) With users and active user", () => {
  const users = [
    {
      username: "user1",
      accessToken: "aa",
      refreshToken: "bb",
      expiresIn: 2,
      postingKey: null
    },
    {
      username: "user2",
      accessToken: "aa",
      refreshToken: "bb",
      expiresIn: 2,
      postingKey: null
    }
  ];

  const activeUser = activeUserMaker("user2");

  const props = { ...defProps, users, activeUser };

  const component = withStore(<Login {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(4) Show keychain option", () => {
  const props = {
    ...defProps,
    global: { ...globalInstance, hasKeyChain: true }
  };

  const component = withStore(<Login {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});
