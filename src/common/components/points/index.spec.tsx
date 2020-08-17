import React from "react";

import {UserPoints} from "./index";

import TestRenderer from "react-test-renderer";

import {createBrowserHistory} from "history";

import {initialState as transactionsInitialState} from "../../store/transactions/index";

import {globalInstance, pointTransactionsInstance} from "../../helper/test-helper";

jest.mock("moment", () => () => ({
    fromNow: () => "5 days ago",
}));

it("(1) Default Render", () => {
    const props = {
        history: createBrowserHistory(),
        global: globalInstance,
        activeUser: null,
        account: {
            name: "user1",
        },
        points: {
            points: "12.010",
            uPoints: "0.000",
            transactions: [...pointTransactionsInstance]
        },
        transactions: transactionsInitialState,
        addAccount: () => {
        },
        updateActiveUser: () => {

        }
    };

    const renderer = TestRenderer.create(<UserPoints {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) With active user", () => {
    const props = {
        history: createBrowserHistory(),
        global: globalInstance,
        activeUser: {
            username: "user1",
            data: {
                name: "user1",
            }
        },
        account: {
            name: "user1",
        },
        points: {
            points: "12.010",
            uPoints: "0.000",
            transactions: [...pointTransactionsInstance]
        },
        transactions: transactionsInitialState,
        addAccount: () => {
        },
        updateActiveUser: () => {

        }
    };

    const renderer = TestRenderer.create(<UserPoints {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});


it("(3) Active user with unclaimed points", () => {
    const props = {
        history: createBrowserHistory(),
        global: globalInstance,
        activeUser: {
            username: "user1",
            data: {
                name: "user1",
            }
        },
        account: {
            name: "user1",
        },
        points: {
            points: "12.010",
            uPoints: "6.200",
            transactions: [...pointTransactionsInstance]
        },
        transactions: transactionsInitialState,
        addAccount: () => {
        },
        updateActiveUser: () => {

        }
    };

    const renderer = TestRenderer.create(<UserPoints {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});
