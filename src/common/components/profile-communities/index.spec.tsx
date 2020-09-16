import React from 'react';
import renderer from "react-test-renderer";

import {createBrowserHistory} from "history";

import {ProfileCommunities} from './index';

import {globalInstance} from "../../helper/test-helper";

const allOver = () => new Promise((resolve) => setImmediate(resolve));

jest.mock("../../api/bridge", () => ({
    getSubscriptions: () =>
        new Promise((resolve) => {
            resolve([
                ["hive-125125", "Ecency", "admin", ""],
                ["hive-139531", "HiveDevs", "mod", ""],
                ["hive-102930", "Hive Improvement", "guest", ""]
            ]);
        }),
    getCommunity: () => new Promise((resolve) => {
        resolve(null);
    })
}));

it('(1) Default render - With data.', async () => {
    const props = {
        history: createBrowserHistory(),
        global: globalInstance,
        activeUser: null,
        account: {
            name: "foo"
        },

    };

    const component = renderer.create(<ProfileCommunities {...props}/>);
    await allOver();
    expect(component.toJSON()).toMatchSnapshot();
});

