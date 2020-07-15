import React from "react";

import Wallet from "./index";

import TestRenderer from "react-test-renderer";

import {createBrowserHistory} from "history";

import {initialState as transactionsInitialState} from "../../store/transactions/index";

import {globalInstance, dynamicPropsIntance1} from "../../helper/test-helper";

jest.mock("moment", () => () => ({
    fromNow: () => "in 5 days",
}));

it("(1) Default Render", () => {
    const account = {
        name: "user1",
        balance: "0.000 HIVE",
        delegated_vesting_shares: "0.000000 VESTS",
        next_vesting_withdrawal: "2020-06-10T18:39:30",
        received_vesting_shares: "9916.938399 VESTS",
        reward_sbd_balance: "0.000 HBD",
        reward_steem_balance: "0.000 HIVE",
        reward_vesting_steem: "10.207 HIVE",
        savings_balance: "0.001 HIVE",
        savings_sbd_balance: "0.000 HBD",
        sbd_balance: "447.514 HBD",
        to_withdraw: 91765607000000,
        vesting_shares: "83549915.208336 VESTS",
        vesting_withdraw_rate: "7058892.846154 VESTS",
        withdrawn: 56471142769232,
        __loaded: true,
    };

    const props = {
        history: createBrowserHistory(),
        global: globalInstance,
        dynamicProps: dynamicPropsIntance1,
        users: [],
        activeUser: null,
        transactions: transactionsInitialState,
        account,
        addAccount: () => {
        },
        updateActiveUser: () => {

        }
    };

    const renderer = TestRenderer.create(<Wallet {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});
