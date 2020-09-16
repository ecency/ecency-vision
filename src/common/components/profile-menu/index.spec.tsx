import React from "react";

import {StaticRouter} from "react-router-dom";

import {createLocation, createBrowserHistory} from "history";

import ProfileMenu from "./index";
import TestRenderer from "react-test-renderer";

import {globalInstance} from "../../helper/test-helper";

it("(1) Render", () => {
    const props = {
        history: createBrowserHistory(),
        location: createLocation({}),
        global: {...globalInstance},
        username: "username",
        section: "posts",
        toggleListStyle: () => {
        },
    };

    const comp = <ProfileMenu {...props} />;

    const renderer = TestRenderer.create(
        <StaticRouter location="/@username" context={{}}>
            {comp}
        </StaticRouter>
    );

    expect(renderer.toJSON()).toMatchSnapshot();
});
