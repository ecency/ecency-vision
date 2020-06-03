import React from "react";

import CommunityCardSm from "./index";
import renderer from "react-test-renderer";
import { createBrowserHistory } from "history";

import { communityInstance1 } from "../../helper/test-helper";

it("(1) Default render", () => {
  const props = {
    history: createBrowserHistory(),
    community: { ...communityInstance1 },
  };

  const component = renderer.create(<CommunityCardSm {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});
