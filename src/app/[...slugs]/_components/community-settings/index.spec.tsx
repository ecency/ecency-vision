import React from "react";

import renderer from "react-test-renderer";

import { CommunitySettings } from "./index";

import { communityInstance1, globalInstance, activeUserMaker } from "../../helper/test-helper";

it("(1) Render", () => {
  const props = {
    global: globalInstance,
    community: { ...communityInstance1 },
    activeUser: activeUserMaker("foo"),
    addCommunity: () => {},
    onHide: () => {}
  };

  const component = renderer.create(<CommunitySettings {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});
