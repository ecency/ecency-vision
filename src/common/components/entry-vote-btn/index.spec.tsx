import React from "react";

import {VoteDialog} from "./index";

import renderer from "react-test-renderer";

import {createBrowserHistory} from "history";

import {globalInstance, discussionInstace1, dynamicPropsIntance1, entryInstance1} from "../../helper/test-helper";
import {Account} from "../../store/accounts/types";

/*
jest.mock("moment", () => () => ({
  fromNow: () => "3 days ago",
  format: (f: string, s: string) => "2020-01-01 23:12:00",
}));

jest.mock("../../api/bridge", () => ({
  getDiscussion: () =>
    new Promise((resolve) => {
      const [, ...replies] = discussionInstace1;
      resolve(replies);
    }),
}));
*/

describe('Vote Dialog', () => {

    const data: Account = {
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
        voting_manabar: {current_mana: "73562964033158", last_update_time: 1591275594},
        profile: {
            name: "Foo Bar",
            about: "Lorem ipsum dolor sit amet",
            website: "https://esteem.app",
            location: "Hive",
        },
        follow_stats: {follower_count: 33497, following_count: 165},
        __loaded: true,
    };


    const props = {
        activeUser: {username: "user1", data},
        dynamicProps: dynamicPropsIntance1,
        global: globalInstance,
        entry: entryInstance1,
        onClick: () => {
        },
    };

    const component = renderer.create(<VoteDialog {...props} />);
    const instance: any = component.getInstance();

    it("(1) Up vote", () => {
        expect(component.toJSON()).toMatchSnapshot();
    });


    it("(2) Down vote", () => {
        instance.changeMode('down');
        expect(component.toJSON()).toMatchSnapshot();
    });

});


