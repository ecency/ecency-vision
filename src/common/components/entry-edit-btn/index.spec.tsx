import React from "react";

import EntryEditBtn from "./index";
import TestRenderer from "react-test-renderer";

import { StaticRouter } from "react-router-dom";

import { entryInstance1 } from "../../helper/test-helper";

const defProps = {
  entry: { ...entryInstance1 },
};

it("(1) Default render", () => {
  const props = { ...defProps };

  const renderer = TestRenderer.create(
    <StaticRouter location="/" context={{}}>
      <EntryEditBtn {...props} />
    </StaticRouter>
  );

  expect(renderer.toJSON()).toMatchSnapshot();
});
