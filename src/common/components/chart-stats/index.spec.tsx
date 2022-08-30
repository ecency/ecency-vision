import React from "react";

import { ChartStats } from "./index";

import TestRenderer from "react-test-renderer";

import { allOver } from "../../helper/test-helper";

it("(1) Default render", async () => {
  const props = {
    loading: false,
    data: {
      hbd_volume: "dummy value",
      highest_bid: "dummy value",
      hive_volume: "dummy value",
      latest: "dummy value",
      lowest_ask: "dummy value",
      percent_change: "dummy value"
    }
  };

  const renderer = await TestRenderer.create(<ChartStats {...props} />);
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Render with loading", async () => {
  const props = {
    loading: true,
    data: null
  };

  const renderer = await TestRenderer.create(<ChartStats {...props} />);
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});
