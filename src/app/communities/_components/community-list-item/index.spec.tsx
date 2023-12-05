import React from "react";

import CommunityListItem from "./index";

import { createBrowserHistory } from "history";
import { StaticRouter } from "react-router-dom";

import { communityInstance1, globalInstance, UiInstance } from "../../helper/test-helper";
import { withStore } from "../../tests/with-store";

it("(1) Default render", () => {
  const props = {
    history: createBrowserHistory(),
    global: globalInstance,
    users: [],
    activeUser: null,
    community: { ...communityInstance1 },
    ui: UiInstance,
    subscriptions: [],
    setActiveUser: () => {},
    updateActiveUser: () => {},
    deleteUser: () => {},
    toggleUIProp: () => {},
    addAccount: () => {},
    updateSubscriptions: () => {}
  };

  const comp = <CommunityListItem {...props} />;

  const renderer = withStore(
    <StaticRouter location="/@username" context={{}}>
      {comp}
    </StaticRouter>
  );

  expect(renderer.toJSON()).toMatchSnapshot();
});
