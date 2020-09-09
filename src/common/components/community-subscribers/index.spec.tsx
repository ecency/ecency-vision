import React from 'react';
import renderer from "react-test-renderer";

import {createBrowserHistory} from "history";

import {Subscribers} from './index';

import {globalInstance, communityInstance1} from "../../helper/test-helper";

const allOver = () => new Promise((resolve) => setImmediate(resolve));


jest.mock("../../api/bridge", () => ({
    getSubscribers: () =>
        new Promise((resolve) => {
            resolve([
                ["foo", "guest", null, "2020-09-09 04:37:54"],
                ["bar", "guest", null, "2020-09-09 04:37:54"],
                ["baz", "guest", null, "2020-09-09 04:37:54"],
                ["lorem", "guest", null, "2020-09-09 04:37:54"],
                ["ipsum", "guest", null, "2020-09-09 04:37:54"],
                ["dolor", "guest", null, "2020-09-09 04:37:54"],
            ]);
        })
}));

it('(1) Default render - With data.', async () => {
    const props = {
        history: createBrowserHistory(),
        global: globalInstance,
        community: {...communityInstance1},
        addAccount: () => {
        },
        onHide: () => {
        }
    };

    const component = renderer.create(<Subscribers {...props}/>);
    await allOver();
    expect(component.toJSON()).toMatchSnapshot();
});

