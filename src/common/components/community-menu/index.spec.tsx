import React from "react";

import {StaticRouter} from "react-router-dom";

import {createLocation, createBrowserHistory} from "history";

import CommunityMenu from "./index";
import TestRenderer from "react-test-renderer";

import {globalInstance, communityInstance1} from "../../helper/test-helper";

it("(1) Render", () => {
    const props = {
        history: createBrowserHistory(),
        location: createLocation({}),
        global: {...globalInstance},
        community: {...communityInstance1},
        toggleListStyle: () => {
        },
        addAccount: () => {
        }
    };

    const comp = <CommunityMenu {...props} />;

    const renderer = TestRenderer.create(
        <StaticRouter location="/hot/hive-125125" context={{}}>
            {comp}
        </StaticRouter>
    );

    expect(renderer.toJSON()).toMatchSnapshot();
});
