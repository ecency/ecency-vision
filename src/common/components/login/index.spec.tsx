import React from "react";

import renderer from "react-test-renderer";

import {Login} from "./index";

import {globalInstance} from "../../helper/test-helper";

const defProps = {
    global: globalInstance,
    users: [],
    activeUser: null,
    setActiveUser: () => {
    },
    addUser: () => {
    },
    updateActiveUser: () => {
    },
    deleteUser: () => {
    },
    toggleUIProp: () => {
    },
};

it("(1) Default render", () => {
    const component = renderer.create(<Login {...defProps} />);
    expect(component.toJSON()).toMatchSnapshot();
});

it("(2) With users", () => {
    const users = [
        {
            username: "user1",
            accessToken: "aa",
            refreshToken: "bb",
            expiresIn: 2,
        },
        {
            username: "user2",
            accessToken: "aa",
            refreshToken: "bb",
            expiresIn: 2,
        },
    ];

    const props = {...defProps, users};

    const component = renderer.create(<Login {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
});

it("(3) With users and active user", () => {
    const users = [
        {
            username: "user1",
            accessToken: "aa",
            refreshToken: "bb",
            expiresIn: 2,
        },
        {
            username: "user2",
            accessToken: "aa",
            refreshToken: "bb",
            expiresIn: 2,
        },
    ];

    const activeUser = {
        username: "user2",
        data: {
            name: "user2",
        },
    };

    const props = {...defProps, users, activeUser};

    const component = renderer.create(<Login {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
});
