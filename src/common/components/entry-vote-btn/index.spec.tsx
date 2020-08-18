import React from "react";

import EntryVoteBtn, {VoteDialog} from "./index";

import renderer from "react-test-renderer";

import {globalInstance, dynamicPropsIntance1, entryInstance1, UiInstance, activeUserMaker} from "../../helper/test-helper";

import {Account} from "../../store/accounts/types";


jest.mock("../../api/hive", () => ({
    vpMana: () => 5,
    getActiveVotes: () =>
        new Promise((resolve) => {
            resolve([{voter: "user1", percent: 10}]);
        }),
}));


describe('(1) Dialog', () => {

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
        activeUser: activeUserMaker("user1"),
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

describe('(2) Btn - No active user', () => {
    const props = {
        global: globalInstance,
        dynamicProps: dynamicPropsIntance1,
        entry: entryInstance1,
        users: [],
        activeUser: null,
        ui: UiInstance,
        setActiveUser: () => {
        },
        updateActiveUser: () => {
        },
        deleteUser: () => {
        },
        afterVote: () => {
        },
        toggleUIProp: () => {

        }
    };

    const component = renderer.create(<EntryVoteBtn {...props} />);

    it("(1) Render", () => {
        expect(component.toJSON()).toMatchSnapshot();
    });
});

describe('(3) Btn - Up voted', () => {

    const props = {
        global: globalInstance,
        dynamicProps: dynamicPropsIntance1,
        entry: entryInstance1,
        users: [{username: 'user1', accessToken: 's', refreshToken: 'b', expiresIn: 1}],
        activeUser: activeUserMaker("user1"),
        ui: UiInstance,
        setActiveUser: () => {
        },
        updateActiveUser: () => {
        },
        deleteUser: () => {
        },
        afterVote: () => {
        },
        toggleUIProp: () => {

        }
    };

    const component = renderer.create(<EntryVoteBtn {...props} />);
    const instance: any = component.getInstance();

    it("(1) Render", () => {
        expect(component.toJSON()).toMatchSnapshot();
    });
});

