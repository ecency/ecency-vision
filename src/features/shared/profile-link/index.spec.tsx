import React from "react";

import ProfileLink from "./index";
import TestRenderer from "react-test-renderer";
import { createBrowserHistory } from "history";

it("(1) Render", () => {
  const props = {
    history: createBrowserHistory(),
    children: <span>username</span>,
    username: "username",
    addAccount: () => {}
  };
  const renderer = TestRenderer.create(<ProfileLink {...props} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});
