import React from "react";

import TestRenderer from "react-test-renderer";

import {globalInstance, allOver, searchResponseInstance } from "../../helper/test-helper";
import {createBrowserHistory, createLocation} from "history";
import renderer from "react-test-renderer";
import {StaticRouter} from "react-router-dom";
import {ProfileCommunities} from "../profile-communities";
import {SearchComment} from "./index"

let TEST_MODE = 0

jest.mock("../../api/private", () => ({
    search: () =>
        new Promise((resolve) => {
            if (TEST_MODE === 0) {
                resolve(searchResponseInstance);
            }
        }),
}));

const defProps = {
    history: createBrowserHistory(),
    location: createLocation({search: "q=lorem"}),
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
