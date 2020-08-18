import React from "react";

import {BookmarkBtn} from "./index";

import TestRenderer from "react-test-renderer";

import {entryInstance1, UiInstance, activeUserInstance} from "../../helper/test-helper";

const allOver = () => new Promise((resolve) => setImmediate(resolve));

let TEST_MODE = 0

jest.mock("../../api/private", () => ({
    getBookmarks: () =>
        new Promise((resolve) => {
            if (TEST_MODE === 0) {
                resolve([]);
            }

            if (TEST_MODE === 1) {
                resolve([
                    {
                        _id: "314123",
                        author: "good-karma",
                        permlink: "awesome-hive",
                    }
                ]);
            }
        }),
}));

const defProps = {
    entry: {...entryInstance1},
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
    const renderer = TestRenderer.create(<BookmarkBtn {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});


it("(2) Not bookmarked", async () => {
    const props = {
        ...defProps,
        activeUser: {...activeUserInstance}
    };

    const component = TestRenderer.create(<BookmarkBtn {...props}/>);
    await allOver();
    expect(component.toJSON()).toMatchSnapshot();
});


it("(3) Bookmarked", async () => {

    TEST_MODE = 1;

    const props = {
        ...defProps,
        activeUser: {...activeUserInstance}
    };

    const component = TestRenderer.create(<BookmarkBtn {...props}/>);
    await allOver();
    expect(component.toJSON()).toMatchSnapshot();
});
