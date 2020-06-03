import React from "react";

import TagLink from "./index";
import TestRenderer from "react-test-renderer";
import { createBrowserHistory } from "history";

import { globalInstance } from "../../helper/test-helper";

import { Filter } from "../../store/global/types";

it("(1) Default render", () => {
  const props = {
    history: createBrowserHistory(),
    global: {
      ...globalInstance,
      ...{
        filter: Filter.hot,
        tag: "bitcoin",
      },
    },
    tag: "bitcoin",
  };

  const renderer = TestRenderer.create(
    <TagLink {...props}>
      <span>bitcoin</span>
    </TagLink>
  );
  expect(renderer.toJSON()).toMatchSnapshot();
});
