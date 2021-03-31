import React from "react";

import {createBrowserHistory} from "history";

import {EntryMenu} from "./index";

import TestRenderer from "react-test-renderer";

import {entryInstance1, globalInstance, dynamicPropsIntance1} from "../../helper/test-helper";

const defProps = {
    history: createBrowserHistory(),
    global: globalInstance,
    dynamicProps: dynamicPropsIntance1,
    activeUser: null,
    entry: entryInstance1,
    communities: [],
    entryPinTracker: {
        pinned: false,
        canFetch: false,
    },
    signingKey: "",
    setSigningKey: () => {
    },
    updateActiveUser: () => {
    },
    updateEntry: () => {
    },
    addCommunity: () => {
    },
    trackEntryPin: () => {
    },
    setEntryPin: () => {
    }
};


it("(1) Default render", () => {
    const props = {...defProps};
    const renderer = TestRenderer.create(<EntryMenu {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Separated sharing buttons", () => {
    const props = {
        ...defProps,
        separatedSharing: true
    };
    const renderer = TestRenderer.create(<EntryMenu {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});

