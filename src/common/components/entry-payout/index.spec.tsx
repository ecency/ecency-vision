import React from "react";

import EntryPayout, { EntryPayoutDetail } from "./index";
import TestRenderer from "react-test-renderer";

import {
  globalInstance,
  entryInstance1,
  dynamicPropsIntance1,
  allOver
} from "../../helper/test-helper";
import { withStore } from "../../tests/with-store";

jest.mock("moment", () => () => ({
  fromNow: () => "in 4 days",
  format: (f: string, s: string) => "2020-01-01 23:12:00"
}));

it("(1) Default render", async () => {
  const props = {
    global: { ...globalInstance },
    dynamicProps: { ...dynamicPropsIntance1 },
    entry: {
      ...entryInstance1,
      ...{
        pending_payout_value: "14.264 HBD",
        promoted: "0.000 HBD",
        author_payout_value: "0.000 HBD",
        curator_payout_value: "0.000 HBD",
        payout_at: "2020-06-03T15:15:24"
      }
    }
  };

  const renderer = await withStore(<EntryPayout {...props} />);
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Detail render", async () => {
  const props = {
    global: { ...globalInstance },
    dynamicProps: { ...dynamicPropsIntance1 },
    entry: {
      ...entryInstance1,
      ...{
        pending_payout_value: "14.264 HBD",
        promoted: "0.000 HBD",
        author_payout_value: "0.000 HBD",
        curator_payout_value: "0.000 HBD",
        payout_at: "2020-06-03T15:15:24"
      }
    }
  };

  const renderer = await TestRenderer.create(<EntryPayoutDetail {...props} />);
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(3) Detail render with full power", async () => {
  const props = {
    global: { ...globalInstance },
    dynamicProps: { ...dynamicPropsIntance1 },
    entry: {
      ...entryInstance1,
      ...{
        percent_hbd: 0,
        pending_payout_value: "14.264 HBD",
        promoted: "0.000 HBD",
        author_payout_value: "0.000 HBD",
        curator_payout_value: "0.000 HBD",
        payout_at: "2020-06-03T15:15:24"
      }
    }
  };

  const renderer = await TestRenderer.create(<EntryPayoutDetail {...props} />);
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(4) Detail render with max payout", async () => {
  const props = {
    global: { ...globalInstance },
    dynamicProps: { ...dynamicPropsIntance1 },
    entry: {
      ...entryInstance1,
      ...{
        percent_hbd: 0,
        pending_payout_value: "14.264 HBD",
        promoted: "0.000 HBD",
        author_payout_value: "0.000 HBD",
        curator_payout_value: "0.000 HBD",
        payout_at: "2020-06-03T15:15:24",
        max_accepted_payout: "10.000 HBD"
      }
    }
  };

  const renderer = await TestRenderer.create(<EntryPayoutDetail {...props} />);
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(5) Default with max payout", async () => {
  const props = {
    global: { ...globalInstance },
    dynamicProps: { ...dynamicPropsIntance1 },
    entry: {
      ...entryInstance1,
      ...{
        pending_payout_value: "14.264 HBD",
        promoted: "0.000 HBD",
        author_payout_value: "0.000 HBD",
        curator_payout_value: "0.000 HBD",
        payout_at: "2020-06-03T15:15:24",
        max_accepted_payout: "10.000 HBD"
      }
    }
  };

  const renderer = await withStore(<EntryPayout {...props} />);
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});
