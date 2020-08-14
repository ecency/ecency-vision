import React from "react";

import {FavoriteBtn} from "./index";

import TestRenderer from "react-test-renderer";

import {entryInstance1, UiInstance} from "../../helper/test-helper";

const allOver = () => new Promise((resolve) => setImmediate(resolve));

let TEST_MODE = 0

jest.mock("../../api/private", () => ({
    checkFavorite: () =>
        new Promise((resolve) => {
            if (TEST_MODE === 0) {
                resolve(false);
            }

            if (TEST_MODE === 1) {
                resolve(true);
            }
        }),
}));

const defProps = {
    targetUsername: "bar",
    activeUser: null,
    users: [],
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

it("(1) No active user", () => {
    const props = {...defProps};
    const renderer = TestRenderer.create(<FavoriteBtn {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});


it("(2) Not Favorited", async () => {
    const props = {
        ...defProps,
        activeUser: {
            username: "foo",
            data: {
                name: "foo"
            }
        }
    };

    const component = TestRenderer.create(<FavoriteBtn {...props}/>);
    await allOver();
    expect(component.toJSON()).toMatchSnapshot();
});


it("(3) Favorited", async () => {

    TEST_MODE = 1;

    const props = {
        ...defProps,
        activeUser: {
            username: "foo",
            data: {
                name: "foo"
            }
        }
    };

    const component = TestRenderer.create(<FavoriteBtn {...props}/>);
    await allOver();
    expect(component.toJSON()).toMatchSnapshot();
});
