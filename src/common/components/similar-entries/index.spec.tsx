import React from 'react';
import renderer from "react-test-renderer";

import {createBrowserHistory, createLocation} from "history";

import {SimilarEntries} from './index';

import {globalInstance, entryInstance1} from "../../helper/test-helper";
import {Entry} from "../../store/entries/types";

const allOver = () => new Promise((resolve) => setImmediate(resolve));

let TEST_MODE = 0

jest.mock("../../api/bridge", () => ({
    getAccountPosts: () =>
        new Promise((resolve) => {
            const p1: Entry = {...entryInstance1, permlink: "foo1"}
            const p2: Entry = {...entryInstance1, permlink: "foo2"}
            const p3: Entry = {...entryInstance1, permlink: "foo3"}
            const p4: Entry = {...entryInstance1, permlink: "foo4"}
            const p5: Entry = {...entryInstance1, permlink: "foo5"}

            if (TEST_MODE === 0) {
                resolve([]);
            }

            if (TEST_MODE === 1) {
                resolve([p1, p2]);
            }

            if (TEST_MODE === 2) {
                resolve([p1, p2, p3, p4, p5]);
            }
        }),
}));

jest.mock("moment", () => () => ({
    fromNow: () => "3 days ago"
}));


it('(1) No data.', async () => {
    const props = {
        history: createBrowserHistory(),
        location: createLocation({}),
        global: globalInstance,
        entry: entryInstance1
    };

    const component = renderer.create(<SimilarEntries {...props}/>);
    await allOver();
    expect(component.toJSON()).toMatchSnapshot();
});


it('(2) Less than 3 entries. Should render null', async () => {
    TEST_MODE = 1;

    const props = {
        history: createBrowserHistory(),
        location: createLocation({}),
        global: globalInstance,
        entry: entryInstance1
    };

    const component = renderer.create(<SimilarEntries {...props}/>);
    await allOver();
    expect(component.toJSON()).toMatchSnapshot();
});


it('(3) Should render entries', async () => {
    TEST_MODE = 2;

    const props = {
        history: createBrowserHistory(),
        location: createLocation({}),
        global: globalInstance,
        entry: entryInstance1
    };

    const component = renderer.create(<SimilarEntries {...props}/>);
    await allOver();
    expect(component.toJSON()).toMatchSnapshot();
});
