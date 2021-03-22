import React from "react";

import {EntryReblogBtn} from "./index";

import TestRenderer from "react-test-renderer";

import {entryInstance1, UiInstance, activeUserMaker} from "../../helper/test-helper";

const defProps = {
    text: false,
    entry: {...entryInstance1},
    users: [],
    activeUser: null,
    reblogs: [],
    ui: UiInstance,
    setActiveUser: () => {
    },
    updateActiveUser: () => {
    },
    deleteUser: () => {
    },
    addReblog: () => {
    },
    deleteReblog: () => {
    },
    toggleUIProp: () => {

    }
};

it("(1) No active user", () => {
    const props = {...defProps};
    const renderer = TestRenderer.create(<EntryReblogBtn {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) With text", () => {
    const props = {...defProps, text: true};
    const renderer = TestRenderer.create(<EntryReblogBtn {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(3) Active user. Not reblogged", () => {
    const props = {...defProps, activeUser: activeUserMaker("user1")};
    const renderer = TestRenderer.create(<EntryReblogBtn {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(4) Active user. Reblogged", () => {
    const props = {
        ...defProps,
        activeUser: activeUserMaker("user1"),
        reblogs: [{account: "user1", author: entryInstance1.author, permlink: entryInstance1.permlink}],
    };
    const renderer = TestRenderer.create(<EntryReblogBtn {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(5) Reblogging", () => {
    const props = {...defProps, activeUser: activeUserMaker("user1")};
    const component = TestRenderer.create(<EntryReblogBtn {...props} />);
    const instance: any = component.getInstance();
    instance.stateSet({inProgress: true});
    expect(component.toJSON()).toMatchSnapshot();
});
