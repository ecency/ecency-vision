import React from "react";

import { StaticRouter } from "react-router-dom";

import { createLocation, createBrowserHistory } from "history";

import ProfileMenu from "./index";
import TestRenderer from "react-test-renderer";

import { globalInstance, activeUserMaker } from "../../helper/test-helper";

const defProps = {
  history: createBrowserHistory(),
  location: createLocation({}),
  global: { ...globalInstance },
  activeUser: null,
  username: "username",
  section: "posts",
  toggleListStyle: () => {}
};

it("(1) Render", () => {
  const props = {
    ...defProps
  };

  const comp = <ProfileMenu {...props} />;

  const renderer = TestRenderer.create(
    <StaticRouter location="/@username" context={{}}>
      {comp}
    </StaticRouter>
  );

  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) With active user", () => {
  const props = {
    ...defProps,
    activeUser: activeUserMaker("username")
  };

  const comp = <ProfileMenu {...props} />;

  const renderer = TestRenderer.create(
    <StaticRouter location="/@username/settings" context={{}}>
      {comp}
    </StaticRouter>
  );

  expect(renderer.toJSON()).toMatchSnapshot();
});
