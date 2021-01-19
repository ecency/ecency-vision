import React from "react";

import TestRenderer from "react-test-renderer";

import {globalInstance, allOver} from "../../helper/test-helper";
import {createBrowserHistory, createLocation} from "history";
import {StaticRouter} from "react-router-dom";
import {SearchPeople} from "./index"

let TEST_MODE = 0;

jest.mock("../../api/hive", () => ({
    lookupAccounts: () =>
        new Promise((resolve) => {
            if (TEST_MODE === 0) {
                resolve(["foo", "bar", "baz"]);
            }

            if (TEST_MODE === 1) {
                resolve([]);
            }

        }),
}));

const defProps = {
    history: createBrowserHistory(),
    location: createLocation({search: "q=foo"}),
    global: globalInstance,
    addAccount: () => {
    },
}

it("(1) Default render", async () => {
    const props = {...defProps};

    const renderer = TestRenderer.create(
        <StaticRouter location="/" context={{}}>
            <SearchPeople {...props}/>
        </StaticRouter>);
    await allOver();
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) No matches", async () => {
    TEST_MODE = 1;
    const props = {...defProps};

    const renderer = TestRenderer.create(
        <StaticRouter location="/" context={{}}>
            <SearchPeople {...props}/>
        </StaticRouter>);
    await allOver();
    expect(renderer.toJSON()).toMatchSnapshot();
});
