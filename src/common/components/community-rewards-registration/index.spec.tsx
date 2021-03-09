import React from "react";

import {CommunityRewardsRegistration} from "./index";

import TestRenderer from "react-test-renderer";

import {globalInstance, communityInstance1, activeUserMaker, allOver} from "../../helper/test-helper";

let MOCK_MODE = 1;

jest.mock("../../api/private-api", () => ({
    getRewardedCommunities: () =>
        new Promise((resolve) => {
            if (MOCK_MODE === 1) {
                resolve([]);
            }

            if (MOCK_MODE === 2) {
                resolve([{
                    name: communityInstance1.name
                }]);
            }
        }),
}));

const defProps = {
    global: globalInstance,
    community: communityInstance1,
    activeUser: activeUserMaker(communityInstance1.name),
    signingKey: '',
    setSigningKey: () => {
    },
    onHide: () => {
    }
};


it("(1) Default render", async () => {
    const renderer = TestRenderer.create(<CommunityRewardsRegistration {...defProps} />);
    await allOver();
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Min subscribers count doesn't match", async () => {
    const props = {
        ...defProps,
        community: {
            ...communityInstance1,
            subscribers: 99
        },
    }
    const renderer = TestRenderer.create(<CommunityRewardsRegistration {...props} />);
    await allOver();
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(3) Already registered", async () => {
    MOCK_MODE = 2
    const renderer = TestRenderer.create(<CommunityRewardsRegistration {...defProps} />);
    await allOver();
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(4) Form screen", async () => {
    const component = TestRenderer.create(<CommunityRewardsRegistration {...defProps} />);
    await allOver();
    const instance: any = component.getInstance();
    instance.setState({form: true});
    expect(component.toJSON()).toMatchSnapshot();
});

it("(5) Success screen", async () => {
    const component = TestRenderer.create(<CommunityRewardsRegistration {...defProps} />);
    await allOver();
    const instance: any = component.getInstance();
    instance.setState({done: true});
    expect(component.toJSON()).toMatchSnapshot();
});
