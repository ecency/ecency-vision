import React from "react";

import {Boost} from "./index";

import TestRenderer from "react-test-renderer";

import {dynamicPropsIntance1, globalInstance, allOver} from "../../helper/test-helper";

jest.mock("../../api/private-api", () => ({
    getBoostOptions: () =>
        new Promise((resolve) => {
            resolve([150, 200, 250, 300, 350, 400, 450, 500, 550]);
        }),
}));


it("(1) Default render", async () => {
    const props = {
        global: globalInstance,
        dynamicProps: dynamicPropsIntance1,
        activeUser: {
            username: 'foo',
            data: {
                name: 'foo',
                balance: '12.234 HIVE',
                hbd_balance: '4321.212',
                savings_balance: '2123.000 HIVE'
            },
            points: {
                points: "500.000",
                uPoints: "0.000"
            }
        },
        signingKey: '',
        updateActiveUser: () => {
        },
        setSigningKey: () => {
        },
        onHide: () => {
        }
    };

    const renderer = TestRenderer.create(<Boost {...props} />);
    await allOver();
    expect(renderer.toJSON()).toMatchSnapshot();
});


it("(2) Insufficient Funds", async () => {
    const props = {
        global: globalInstance,
        dynamicProps: dynamicPropsIntance1,
        activeUser: {
            username: 'foo',
            data: {
                name: 'foo',
                balance: '12.234 HIVE',
                hbd_balance: '4321.212',
                savings_balance: '2123.000 HIVE'
            },
            points: {
                points: "10.000",
                uPoints: "0.000"
            }
        },
        signingKey: '',
        updateActiveUser: () => {
        },
        setSigningKey: () => {
        },
        onHide: () => {

        }
    };

    const renderer = TestRenderer.create(<Boost {...props} />);
    await allOver();
    expect(renderer.toJSON()).toMatchSnapshot();
});

