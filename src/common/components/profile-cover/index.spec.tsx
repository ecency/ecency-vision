import React from "react";

import ProfileCover from "./index";
import renderer from "react-test-renderer";

import {Theme} from "../../store/global/types";
import {Account} from "../../store/accounts/types";

import {globalInstance, UiInstance, fullAccountInstance, dynamicPropsIntance1} from "../../helper/test-helper";

jest.mock("../../constants/defaults.json", () => ({
    imageServer: "https://images.ecency.com",
}));

jest.mock("../../api/hive", () => ({
    getFollowing: () =>
        new Promise((resolve) => {
            resolve([]);
        }),

    votingPower: () => 0,
    votingValue: () => 0
}));


const defProps = {
    global: {...globalInstance},
    dynamicProps: dynamicPropsIntance1,
    users: [],
    activeUser: null,
    ui: UiInstance,
    setActiveUser: () => {
    },
    updateActiveUser: () => {
    },
    deleteUser: () => {
    },
    toggleUIProp: () => {

    }
};

it("(1) Render with loaded account object", () => {
    const account: Account = {
        ...fullAccountInstance,
        name: "user1",
        profile: {
            cover_image: "https://img.esteem.app/rwd380.jpg",
        }
    };

    const props = {
        ...defProps,
        account,
    };

    const component = renderer.create(<ProfileCover {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
});


it("(2) Render with mot loaded account object", () => {
    const account: Account = {
        name: "user1",
    };

    const props = {
        ...defProps,
        account,
    };

    const component = renderer.create(<ProfileCover {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
});


it("(3) No bg image - Day theme", () => {
    const account: Account = {
        ...fullAccountInstance,
        name: "user1",
        profile: {}
    };

    const props = {
        ...defProps,
        account,
    };

    const component = renderer.create(<ProfileCover {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
});

it("(4) No bg image - Night theme", () => {
    const account: Account = {
        ...fullAccountInstance,
        name: "user1",
        profile: {}
    };

    const props = {
        ...defProps,
        global: {...globalInstance, ...{theme: Theme.night}},
        account,
    };

    const component = renderer.create(<ProfileCover {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
});

