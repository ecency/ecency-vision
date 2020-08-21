import React from "react";

import {Promote} from "./index";

import TestRenderer from "react-test-renderer";

const allOver = () => new Promise((resolve) => setImmediate(resolve));

jest.mock("../../api/private", () => ({
    getPromotePrice: () =>
        new Promise((resolve) => {
            resolve(
                [
                    {"price": 150, "duration": 1},
                    {"price": 250, "duration": 2},
                    {"price": 350, "duration": 3},
                    {"price": 500, "duration": 7},
                    {"price": 1000, "duration": 14}
                ]
            );
        }),
}));


it("(1) Default render", async () => {
    const props = {
        activeUser: {
            username: 'foo',
            data: {
                name: 'foo',
                balance: '12.234 HIVE',
                sbd_balance: '4321.212',
                savings_balance: '2123.000 HIVE'
            },
            points: {
                points: "500.000",
                uPoints: "0.000"
            }
        },
        updateActiveUser: () => {

        },
        onHide: () => {

        }
    };

    const renderer = TestRenderer.create(<Promote {...props} />);
    await allOver();
    expect(renderer.toJSON()).toMatchSnapshot();
});


it("(2) Insufficient Funds", async () => {
    const props = {
        activeUser: {
            username: 'foo',
            data: {
                name: 'foo',
                balance: '12.234 HIVE',
                sbd_balance: '4321.212',
                savings_balance: '2123.000 HIVE'
            },
            points: {
                points: "10.000",
                uPoints: "0.000"
            }
        },
        updateActiveUser: () => {

        },
        onHide: () => {

        }
    };

    const renderer = TestRenderer.create(<Promote {...props} />);
    await allOver();
    expect(renderer.toJSON()).toMatchSnapshot();
});

