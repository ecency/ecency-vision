import React from "react";

import { HiveBarter } from "./index";

import TestRenderer from "react-test-renderer";

import { activeUserInstance, allOver, globalInstance } from "../../helper/test-helper";

it("(1) Buying render", async () => {
  const props = {
    available: "dummy value",
    username: "dummy value",
    peakValue: 6.9,
    basePeakValue: 9.0,
    loading: false,
    activeUser: activeUserInstance,
    global: globalInstance,
    onClickPeakValue: (value: any) => {},
    onTransactionSuccess: () => {}
  };

  const renderer = await TestRenderer.create(<HiveBarter {...props} type={1} />);
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(1) Selling render", async () => {
  const props = {
    available: "dummy value",
    username: "dummy value",
    peakValue: 6.9,
    basePeakValue: 9.0,
    loading: false,
    activeUser: activeUserInstance,
    global: globalInstance,
    onClickPeakValue: (value: any) => {},
    onTransactionSuccess: () => {}
  };

  const renderer = await TestRenderer.create(<HiveBarter {...props} type={2} />);
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});
