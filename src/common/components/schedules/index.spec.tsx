import * as React from 'react';
import renderer from "react-test-renderer";

import {createBrowserHistory, createLocation} from "history";

import {Schedules, ListItem} from './index';

import {globalInstance, activeUserInstance, fullAccountInstance} from "../../helper/test-helper";

const allOver = () => new Promise((resolve) => setImmediate(resolve));

let TEST_MODE = 0

jest.mock("../../api/private", () => ({
    getSchedules: () =>
        new Promise((resolve) => {
            if (TEST_MODE === 0) {
                resolve([]);
            }

            if (TEST_MODE === 1) {
                resolve([{
                    "id": "0f4cdce5-7fbe-467d-bdb4-0e600b108774",
                    "account": "foo",
                    "permlink": "eget-suscipit-quam-suspendisse",
                    "title": "Eget suscipit quam suspendisse",
                    "body": "Aliquam erat volutpat. Phasellus eget suscipit quam. Suspendisse et sapien ac tellus rhoncus pulvinar vitae id leo.",
                    "tags": ["hive-125125", "ecency"],
                    "schedule": "2020-12-28T19:00:00+00:00",
                    "original_schedule": "2020-12-28T19:00:00+00:00",
                    "reblog": true,
                    "status": 1,
                    "message": null
                }, {
                    "id": "0f4cdce5-7fbe-467d-bdb4-0e600b108775",
                    "account": "foo",
                    "permlink": "eget-suscipit-quam-suspendisse",
                    "title": "Eget suscipit quam suspendisse",
                    "body": "Aliquam erat volutpat. Phasellus eget suscipit quam. Suspendisse et sapien ac tellus rhoncus pulvinar vitae id leo.",
                    "tags": ["hive-125125", "ecency", "test"],
                    "schedule": "2020-11-28T19:00:00+00:00",
                    "original_schedule": "2020-11-28T19:00:00+00:00",
                    "reblog": false,
                    "status": 3,
                    "message": "tx0000000"
                }, {
                    "id": "0f4cdce5-7fbe-467d-bdb4-0e600b108776",
                    "account": "foo",
                    "permlink": "eget-suscipit-quam-suspendisse",
                    "title": "Eget suscipit quam suspendisse",
                    "body": "Aliquam erat volutpat. Phasellus eget suscipit quam. Suspendisse et sapien ac tellus rhoncus pulvinar vitae id leo.",
                    "tags": ["hive-125125", "ecency", "test"],
                    "schedule": "2020-11-28T19:00:00+00:00",
                    "original_schedule": "2020-11-28T19:00:00+00:00",
                    "reblog": false,
                    "status": 2,
                    "message": "Rescheduled (Not enough RC)"
                }, {
                    "id": "0f4cdce5-7fbe-467d-bdb4-0e600b108777",
                    "account": "foo",
                    "permlink": "eget-suscipit-quam-suspendisse",
                    "title": "Eget suscipit quam suspendisse",
                    "body": "Aliquam erat volutpat. Phasellus eget suscipit quam. Suspendisse et sapien ac tellus rhoncus pulvinar vitae id leo.",
                    "tags": ["hive-125125", "ecency", "test"],
                    "schedule": "2020-11-28T19:00:00+00:00",
                    "original_schedule": "2020-11-28T19:00:00+00:00",
                    "reblog": false,
                    "status": 4,
                    "message": "missing required posting authority"
                }])
            }
        }),
}));

jest.mock("moment", () => () => ({
    fromNow: () => "3 days ago",
    format: (f: string, s: string) => "2020-01-01 23:12:00",
}));

const defProps = {
    history: createBrowserHistory(),
    location: createLocation({}),
    global: globalInstance,
    activeUser: {
        ...activeUserInstance,
        ...{data: fullAccountInstance}
    },
    onHide: () => {
    }
}


it('(1) Empty list', async () => {
    const component = renderer.create(<Schedules {...defProps}/>);
    await allOver();
    expect(component.toJSON()).toMatchSnapshot();
});

it('(2) With data', async () => {
    TEST_MODE = 1;

    const component = renderer.create(<Schedules {...defProps}/>);
    await allOver();
    expect(component.toJSON()).toMatchSnapshot();
});

