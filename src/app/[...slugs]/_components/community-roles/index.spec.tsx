import React from "react";

import renderer from "react-test-renderer";
import { createBrowserHistory, createLocation } from "history";

import { CommunityRoles } from "./index";

import { communityInstance1, globalInstance, activeUserMaker } from "../../helper/test-helper";
import { withStore } from "../../tests/with-store";

it("(1) Default render", () => {
  const props = {
    history: createBrowserHistory(),
    location: createLocation({}),
    global: globalInstance,
    community: { ...communityInstance1 },
    activeUser: null,
    addAccount: () => {},
    addCommunity: () => {}
  };

  const component = withStore(<CommunityRoles {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Should not show add user button", () => {
  const props = {
    history: createBrowserHistory(),
    location: createLocation({}),
    global: globalInstance,
    community: { ...communityInstance1 },
    activeUser: activeUserMaker("foo"),
    addAccount: () => {},
    addCommunity: () => {}
  };

  const component = withStore(<CommunityRoles {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(3) Should show add user button", () => {
  const props = {
    history: createBrowserHistory(),
    location: createLocation({}),
    global: globalInstance,
    community: { ...communityInstance1 },
    activeUser: activeUserMaker("hive-148441"),
    addAccount: () => {},
    addCommunity: () => {}
  };

  const component = withStore(<CommunityRoles {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});
