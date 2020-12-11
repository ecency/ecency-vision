import React from "react";

import {createBrowserHistory} from "history";

import {StaticRouter} from "react-router-dom";

import {Account} from "../../store/accounts/types";

import ProfileCard from "./index";
import renderer from "react-test-renderer";

import {globalInstance, activeUserInstance, activeUserMaker, fullAccountInstance} from "../../helper/test-helper";

jest.mock("../../constants/defaults.json", () => ({
    imageServer: "https://images.ecency.com",
    base: "https://ecency.com",
}));

// Mock for manabar calculation
Date.now = jest.fn(() => 1591276905521);

it("(1) Render with not loaded data", () => {
    const account: Account = {
        name: "user1",
    };

    const props = {
        global: globalInstance,
        history: createBrowserHistory(),
        activeUser: null,
        account,
        addAccount: () => {
        },
        updateActiveUser: () => {
        }
    };

    const component = renderer.create(<StaticRouter location="/" context={{}}>
        <ProfileCard {...props} />
    </StaticRouter>);
    expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Render with loaded data", () => {
    const account: Account = {
        ...fullAccountInstance,
        name: "user1",
    };

    const props = {
        global: globalInstance,
        history: createBrowserHistory(),
        account,
        activeUser: null,
        addAccount: () => {
        },
        updateActiveUser: () => {
        }
    };

    const component = renderer.create(<StaticRouter location="/" context={{}}>
        <ProfileCard {...props} />
    </StaticRouter>);
    expect(component.toJSON()).toMatchSnapshot();
});

it("(3) Should show profile edits", () => {
    const account: Account = {
        ...fullAccountInstance,
        name: "user1",
    };

    const props = {
        global: globalInstance,
        history: createBrowserHistory(),
        account,
        activeUser: {
            ...activeUserMaker("user1"),
            ...{
                data: {
                    name: "foo",
                    profile: {
                        name: 'Foo B.',
                        about: 'Lorem ipsum dolor sit amet',
                        website: 'https://lipsum.com',
                        location: 'New York',
                        cover_image: 'https://www.imgur.com/cover-image.jpg',
                        profile_image: 'https://www.imgur.com/profile-image.jpg',
                    }
                }
            }
        },
        addAccount: () => {
        },
        updateActiveUser: () => {
        }
    };

    const component = renderer.create(<StaticRouter location="/" context={{}}>
        <ProfileCard {...props} />
    </StaticRouter>);
    expect(component.toJSON()).toMatchSnapshot();
});
