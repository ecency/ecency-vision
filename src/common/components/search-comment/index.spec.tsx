import React from "react";

import TestRenderer from "react-test-renderer";

import {globalInstance, allOver, searchResponseInstance} from "../../helper/test-helper";
import {createBrowserHistory, createLocation} from "history";
import {StaticRouter} from "react-router-dom";
import {SearchComment} from "./index"

let TEST_MODE = 0

jest.mock("../../api/private", () => ({
    search: () =>
        new Promise((resolve) => {
            if (TEST_MODE === 0) {
                resolve(searchResponseInstance);
            }

            if (TEST_MODE === 1) {
                resolve({
                    ...searchResponseInstance,
                    hits: 4
                });
            }

            if (TEST_MODE === 2) {

                resolve({
                    ...searchResponseInstance,
                    hits: 0
                });
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
            <SearchComment {...props}/>
        </StaticRouter>);
    await allOver();
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) With limit", async () => {
    const props = {
        ...defProps,
        limit: 8
    };

    const renderer = TestRenderer.create(
        <StaticRouter location="/" context={{}}>
            <SearchComment {...props}/>
        </StaticRouter>);
    await allOver();
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(3) Hide show more button", async () => {

    TEST_MODE = 1;

    const props = {
        ...defProps,
        limit: 8
    };

    const renderer = TestRenderer.create(
        <StaticRouter location="/" context={{}}>
            <SearchComment {...props}/>
        </StaticRouter>);
    await allOver();
    expect(renderer.toJSON()).toMatchSnapshot();
});


it("(3) No matches", async () => {

    TEST_MODE = 2;

    const props = {
        ...defProps
    };

    const renderer = TestRenderer.create(
        <StaticRouter location="/" context={{}}>
            <SearchComment {...props}/>
        </StaticRouter>);
    await allOver();
    expect(renderer.toJSON()).toMatchSnapshot();
});
