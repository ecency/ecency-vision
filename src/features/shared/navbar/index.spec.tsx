import React from "react";
import { StaticRouter } from "react-router-dom";
import TestRenderer from "react-test-renderer";
import { createBrowserHistory, createLocation } from "history";

import NavBar from "./index";

import { Theme } from "../../store/global/types";

import {
  globalInstance,
  TrendingTagsInstance,
  UiInstance,
  notificationsInstance1,
  activeUserInstance,
  dynamicPropsIntance1
} from "../../helper/test-helper";
import "./matchMedia";
import { withStore } from "../../tests/with-store";

const defProps = {
  history: createBrowserHistory(),
  location: createLocation({}),
  global: globalInstance,
  dynamicProps: dynamicPropsIntance1,
  trendingTags: TrendingTagsInstance,
  users: [],
  activeUser: null,
  ui: UiInstance,
  notifications: notificationsInstance1,
  step: 2,
  fetchTrendingTags: () => {},
  toggleTheme: () => {},
  addUser: () => {},
  setActiveUser: () => {},
  updateActiveUser: () => {},
  addAccount: () => {},
  deleteUser: () => {},
  fetchNotifications: () => {},
  fetchUnreadNotificationCount: () => {},
  setNotificationsFilter: () => {},
  markNotifications: () => {},
  toggleUIProp: () => {},
  muteNotifications: () => {},
  unMuteNotifications: () => {},
  setLang: () => {},
  setStepOne: () => {},
  fetchNotificationsSettings: () => {}
} as any;

//const itif = (condition) => condition ? it : it.skip;

it("(1) Default render", () => {
  const component = <NavBar {...defProps} />;

  const renderer = withStore(
    <StaticRouter location="/" context={{}}>
      {component}
    </StaticRouter>
  );

  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Night Theme", () => {
  const props = {
    ...defProps,
    ...{
      global: {
        ...globalInstance,
        theme: Theme.night
      }
    }
  };
  const component = <NavBar {...props} />;

  const renderer = withStore(
    <StaticRouter location="/" context={{}}>
      {component}
    </StaticRouter>
  );

  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(3) With active user", () => {
  const props = {
    ...defProps,
    ...{
      activeUser: { ...activeUserInstance }
    }
  };
  const component = <NavBar {...props} />;

  const renderer = withStore(
    <StaticRouter location="/" context={{}}>
      {component}
    </StaticRouter>
  );

  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(4) With active user && usePrivate = false", () => {
  const props = {
    ...defProps,
    ...{
      activeUser: { ...activeUserInstance }
    },
    global: {
      ...globalInstance,
      usePrivate: false
    }
  };

  const component = <NavBar {...props} />;

  const renderer = withStore(
    <StaticRouter location="/" context={{}}>
      {component}
    </StaticRouter>
  );

  expect(renderer.toJSON()).toMatchSnapshot();
});
