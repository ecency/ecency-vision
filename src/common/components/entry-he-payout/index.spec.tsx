import React from "react";

import { EntryHEPayoutDisplay } from "./index";
import TestRenderer from "react-test-renderer";

import {
  globalInstance,
  entryInstance1,
  dynamicPropsIntance1,
  allOver
} from "../../helper/test-helper";

jest.mock("moment", () => () => ({
  fromNow: () => "in 4 days",
  format: (f: string, s: string) => "2020-01-01 23:12:00"
}));

it("(1) Default render", async () => {
  const props = {
    scotRewards: []
  };

  const renderer = await TestRenderer.create(<EntryHEPayoutDisplay {...props} />);
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Detail render", async () => {
  const props = {
    scotRewards: ["2.4 mPESOS", "38.7 kPIMP", "42 LEO"]
  };

  const renderer = await TestRenderer.create(<EntryHEPayoutDisplay {...props} />);
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(3) Detail render with full power", async () => {
  const props = {
    scotRewards: ["2.4 mPESOS", "38.7 kPIMP", "42 LEO"]
  };

  const renderer = await TestRenderer.create(<EntryHEPayoutDisplay {...props} />);
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(4) Detail render with max payout", async () => {
  const props = {
    scotRewards: ["1.19 LEO", "1.94 POB"]
  };

  const renderer = await TestRenderer.create(<EntryHEPayoutDisplay {...props} />);
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(5) Default with max payout", async () => {
  const props = {
    scotRewards: "1.6 ARCHON, 4.69 CTP, 358.27 kPIMP, 1.08 POB".split(/, /)
  };

  const renderer = await TestRenderer.create(<EntryHEPayoutDisplay {...props} />);
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});
