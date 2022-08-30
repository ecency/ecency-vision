import React from "react";

import MarketChart from "./index";

import TestRenderer from "react-test-renderer";

import { allOver } from "../../helper/test-helper";

it("(1) Default render", async () => {
  const props = {
    loading: false,
    bids: [],
    asks: [],
    theme: "day"
  };

  const renderer = await TestRenderer.create(<MarketChart {...props} />);
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});
