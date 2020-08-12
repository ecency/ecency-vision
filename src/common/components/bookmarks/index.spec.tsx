import React from 'react';
import renderer from "react-test-renderer";

import {createBrowserHistory} from "history";

import {Bookmarks} from './index';

import {globalInstance} from "../../helper/test-helper";

const allOver = () => new Promise((resolve) => setImmediate(resolve));

let TEST_MODE = 0

jest.mock("../../api/private", () => ({
    getBookmarks: () =>
        new Promise((resolve) => {
            if (TEST_MODE === 0) {
                resolve([]);
            }

            if (TEST_MODE === 1) {
                resolve([{
                    "author": "tarazkp",
                    "permlink": "she-ll-be-apples",
                    "created": "Wed Aug 12 2020 15:31:29 GMT+0200 (Central European Summer Time)",
                    "_id": "5f33ef31baede01c77aa1809",
                    "timestamp": 1597239089185
                }, {
                    "author": "bluemoon",
                    "permlink": "on-an-island",
                    "created": "Wed Aug 12 2020 16:18:50 GMT+0200 (Central European Summer Time)",
                    "_id": "5f33fa4abaede01c77aa1825",
                    "timestamp": 1597241930103
                }, {
                    "author": "acidyo",
                    "permlink": "dissolution-f2p-crypto-futuristic-fps",
                    "created": "Wed Aug 12 2020 16:19:29 GMT+0200 (Central European Summer Time)",
                    "_id": "5f33fa71baede01c77aa1826",
                    "timestamp": 1597241969917
                }, {
                    "author": "johnvibes",
                    "permlink": "after-multiple-ft-hood-soldiers-murdered-2-more-soldiers-arrested-in-child-trafficking-sting",
                    "created": "Wed Aug 12 2020 16:20:37 GMT+0200 (Central European Summer Time)",
                    "_id": "5f33fab5baede01c77aa182c",
                    "timestamp": 1597242037781
                }, {
                    "author": "kommienezuspadt",
                    "permlink": "iexnncxb",
                    "created": "Wed Aug 12 2020 16:20:45 GMT+0200 (Central European Summer Time)",
                    "_id": "5f33fabdbaede01c77aa182d",
                    "timestamp": 1597242045183
                }])
            }
        }),
}));

it('(1) Default render.', async () => {
    const props = {
        history: createBrowserHistory(),
        global: globalInstance,
        activeUser: {username: "foo", data: {name: "foo"}},
        onHide: () => {
        }
    };

    const component = renderer.create(<Bookmarks {...props}/>);
    await allOver();
    expect(component.toJSON()).toMatchSnapshot();
});

it('(2) Test with data.', async () => {
    TEST_MODE = 1;

    const props = {
        history: createBrowserHistory(),
        global: globalInstance,
        activeUser: {username: "foo", data: {name: "foo"}},
        onHide: () => {
        }
    };

    const component = renderer.create(<Bookmarks {...props}/>);
    await allOver();
    expect(component.toJSON()).toMatchSnapshot();
});
