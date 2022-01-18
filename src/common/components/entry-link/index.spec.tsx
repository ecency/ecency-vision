import React from "react";

import EntryLink from "./index";

import TestRenderer from "react-test-renderer";
import { createBrowserHistory } from "history";

it("(1) Default Render", () => {
  const props = {
    history: createBrowserHistory(),
    children: <span>click here</span>,
    entry: {
      category: "photography",
      author: "foo",
      permlink: "foo-bar-baz"
    }
  };
  const renderer = TestRenderer.create(<EntryLink {...props} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});
