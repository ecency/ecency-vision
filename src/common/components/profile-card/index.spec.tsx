import React from "react";

import { Account } from "../../store/accounts/types";

import ProfileCard from "./index";
import renderer from "react-test-renderer";

jest.mock("../../constants/defaults.json", () => ({
  imageServer: "https://images.esteem.app",
  base: "https://ecency.com",
}));

// Mock for manabar calculation
Date.now = jest.fn(() => 1591276905521); 

it("(1) Render with not loaded data", () => {
  const account: Account = {
    name: "user1",
  };

  const props = {
    account,
  };

  const component = renderer.create(<ProfileCard {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Render with loaded data", () => {
  const account: Account = {
    name: "user1",
    reputation: "33082349040",
    post_count: 4353,
    created: "2016-07-07T08:15:00",
    vesting_shares: "0.000000 VESTS",
    delegated_vesting_shares: "0.000000 VESTS",
    received_vesting_shares: "77883823.534631 VESTS",
    vesting_withdraw_rate: "0.000000 VESTS",
    to_withdraw: 0,
    withdrawn: 0,
    voting_manabar: { current_mana: "73562964033158", last_update_time: 1591275594 },
    profile: {
      name: "Foo Bar",
      about: "Lorem ipsum dolor sit amet",
      website: "https://esteem.app",
      location: "Hive",
    },
    follow_stats: { follower_count: 33497, following_count: 165 },
    __loaded: true,
  };

  const props = {
    account,
  };

  const component = renderer.create(<ProfileCard {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});
