import React from "react";

import renderer from "react-test-renderer";
import {createBrowserHistory} from "history";
import {StaticRouter} from "react-router-dom";

import {CommunityCard} from "./index";

import {communityInstance1, globalInstance, activeUserMaker} from "../../helper/test-helper";

it("(1) Default render", () => {
    const props = {
        history: createBrowserHistory(),
        global: globalInstance,
        community: {...communityInstance1},
        activeUser: null,
        addAccount: () => {
        }
    };

    const component = renderer.create(<CommunityCard {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Should show edit roles button", () => {
    const props = {
        history: createBrowserHistory(),
        global: globalInstance,
        community: {...communityInstance1},
        activeUser: activeUserMaker("hive-148441"),
        addAccount: () => {
        }
    };

    const component = renderer.create(
        <StaticRouter location="/hive-148441" context={{}}>
            <CommunityCard {...props} />
        </StaticRouter>);
    expect(component.toJSON()).toMatchSnapshot();
});
