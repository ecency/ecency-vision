import React from "react";
import renderer from "react-test-renderer";
import { createBrowserHistory } from "history";

import CommunityPostBtn from "./index";

import { communityInstance1 } from "../../helper/test-helper";

const defProps = {
  history: createBrowserHistory(),
  community: { ...communityInstance1 },
  buttonProps: { block: true }
};

it("(1) Default render", () => {
  const props = { ...defProps };
  const component = renderer.create(<CommunityPostBtn {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});
