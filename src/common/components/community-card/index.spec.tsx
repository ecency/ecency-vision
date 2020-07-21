import React from "react";

import CommunityCard from "./index";
import renderer from "react-test-renderer";
import {createBrowserHistory} from "history";

import {communityInstance1, UiInstance} from "../../helper/test-helper";

it("(1) Default render", () => {
    const props = {
        history: createBrowserHistory(),
        users: [],
        activeUser: null,
        community: {...communityInstance1},
        ui: UiInstance,
        subscriptions: [],
        addAccount: () => {
        },
        setActiveUser: () => {
        },
        updateActiveUser: () => {
        },
        deleteUser: () => {

        },
        toggleUIProp: () => {

        },
        updateSubscriptions: () => {

        }
    };



    const component = renderer.create(<CommunityCard {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
});
