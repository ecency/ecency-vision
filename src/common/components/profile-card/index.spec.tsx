import React from "react";

import { createBrowserHistory } from "history";

import { StaticRouter } from "react-router-dom";

import { Account } from "../../store/accounts/types";

import ProfileCard from "./index";

import {
  globalInstance,
  activeUserMaker,
  fullAccountInstance,
  allOver
} from "../../helper/test-helper";
import { withStore } from "../../tests/with-store";

jest.mock("../../constants/defaults.json", () => ({
  imageServer: "https://images.ecency.com",
  base: "https://ecency.com"
}));

// Mock for manabar calculation
Date.now = jest.fn(() => 1591276905521);

const account: Account = {
  name: "user1"
};

const accountFull: Account = {
  ...fullAccountInstance,
  name: "user1",
  reputation: "33082349040",
  created: "2016-07-07T08:15:00",
  vesting_shares: "0.000000 VESTS",
  delegated_vesting_shares: "0.000000 VESTS",
  received_vesting_shares: "77883823.534631 VESTS",
  vesting_withdraw_rate: "0.000000 VESTS",
  voting_manabar: { current_mana: "73562964033158", last_update_time: 1591275594 },
  profile: {
    name: "Foo Bar",
    about: "Lorem ipsum dolor sit amet",
    website: "https://esteem.app",
    location: "Hive"
  }
};

const defProps = {
  global: globalInstance,
  history: createBrowserHistory(),
  activeUser: null,
  account,
  section: "",
  addAccount: () => {},
  updateActiveUser: () => {}
};

it("(1) Render with not loaded data", async () => {
  const component = withStore(
    <StaticRouter location="/" context={{}}>
      <ProfileCard {...defProps} />
    </StaticRouter>
  );
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Render with loaded data", async () => {
  const props = {
    ...defProps,
    account: accountFull
  };

  const component = withStore(
    <StaticRouter location="/" context={{}}>
      <ProfileCard {...props} />
    </StaticRouter>
  );
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(3) Should show profile edits", async () => {
  const props = {
    ...defProps,
    account: accountFull,
    activeUser: {
      ...activeUserMaker("user1"),
      ...{
        data: {
          ...accountFull
        }
      }
    }
  };

  const component = withStore(
    <StaticRouter location="/" context={{}}>
      <ProfileCard {...props} />
    </StaticRouter>
  );
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});
