import React from "react";

import { StaticRouter } from "react-router-dom";

import ProfileMenu from "./index";
import TestRenderer from "react-test-renderer";

it("(1) Render", () => {
  const props = {
    global: {
      listStyle: "row",
    },
    username: "username",
    section: "blog",
    toggleListStyle: () => {},
  };

  // @ts-ignore
  const comp = <ProfileMenu {...props} />;

  const renderer = TestRenderer.create(
    <StaticRouter location="/@username" context={{}}>
      {comp}
    </StaticRouter>
  );

  expect(renderer.toJSON()).toMatchSnapshot();
});
