import React from "react";

import TestRenderer from "react-test-renderer";

import MyPagination from "./index";

it("(1) Default render", () => {
  const props = {
    dataLength: 25,
    pageSize: 6,
    maxItems: 3,
    onPageChange: () => {}
  };
  const renderer = TestRenderer.create(<MyPagination {...props} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});
