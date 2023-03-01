import React from "react";

import renderer from "react-test-renderer";
import { createBrowserHistory } from "history";
import { StaticRouter } from "react-router-dom";

import { CommunityCard } from "./index";

import { communityInstance1, globalInstance, activeUserMaker } from "../../helper/test-helper";
import { withStore } from "../../tests/with-store";

it("(1) Default render", () => {
  const props = {
    history: createBrowserHistory(),
    global: globalInstance,
    community: { ...communityInstance1 },
    account: {
      name: communityInstance1.name
    },
    users: [],
    signingKey: "",
    activeUser: null,
    setSigningKey: () => {},
    addAccount: () => {},
    addCommunity: () => {}
  };

  const component = withStore(<CommunityCard {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Should show edit buttons with nsfw label", () => {
  const props = {
    history: createBrowserHistory(),
    global: globalInstance,
    community: { ...communityInstance1, is_nsfw: true },
    account: {
      name: communityInstance1.name
    },
    users: [],
    signingKey: "",
    activeUser: activeUserMaker("hive-148441"),
    setSigningKey: () => {},
    addAccount: () => {},
    addCommunity: () => {}
  };

  const component = withStore(
    <StaticRouter location="/hive-148441" context={{}}>
      <CommunityCard {...props} />
    </StaticRouter>
  );
  expect(component.toJSON()).toMatchSnapshot();
});

it("(3) usePrivate = false", () => {
  const props = {
    history: createBrowserHistory(),
    global: {
      ...globalInstance,
      usePrivate: false
    },
    community: { ...communityInstance1, is_nsfw: true },
    account: {
      name: communityInstance1.name
    },
    users: [],
    signingKey: "",
    activeUser: activeUserMaker("hive-148441"),
    setSigningKey: () => {},
    addAccount: () => {},
    addCommunity: () => {}
  };

  const component = withStore(
    <StaticRouter location="/hive-148441" context={{}}>
      <CommunityCard {...props} />
    </StaticRouter>
  );
  expect(component.toJSON()).toMatchSnapshot();
});
