import React from "react";

import {CommunityCard} from "./index";
import renderer from "react-test-renderer";
import {createBrowserHistory} from "history";

import {communityInstance1, globalInstance} from "../../helper/test-helper";

it("(1) Default render", () => {
    const props = {
        history: createBrowserHistory(),
        global: globalInstance,
        community: {...communityInstance1},
        addAccount: () => {
        }
    };

    const component = renderer.create(<CommunityCard {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
});
