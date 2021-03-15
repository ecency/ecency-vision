import React from "react";

import {createBrowserHistory, createLocation} from "history";

import mockDate from "mockdate";

import {StaticRouter} from "react-router-dom";

import TestRenderer from "react-test-renderer";

import {globalInstance, dynamicPropsIntance1, entryInstance1, UiInstance, activeUserMaker} from "../../helper/test-helper";

import {ListStyle} from "../../store/global/types";

import EntryListItem from "./index";


mockDate.set(1591398131174);

const defProps = {
    history: createBrowserHistory(),
    location: createLocation({}),
    global: globalInstance,
    dynamicProps: dynamicPropsIntance1,
    communities: [],
    community: null,
    users: [],
    activeUser: null,
    reblogs: [],
    entry: entryInstance1,
    ui: UiInstance,
    asAuthor: "",
    promoted: false,

    addAccount: () => {
    },
    updateEntry: () => {
    },
    setActiveUser: () => {
    },
    updateActiveUser: () => {
    },
    deleteUser: () => {
    },
    addReblog: () => {
    },
    toggleUIProp: () => {
    },
}

it("(1) Default render", () => {
    const renderer = TestRenderer.create(
        <StaticRouter location="/" context={{}}>
            <EntryListItem {...defProps} />
        </StaticRouter>);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Grid view", () => {

    const props = {
        ...defProps,
        global: {
            ...globalInstance,
            listStyle: ListStyle.grid
        }
    }
    const renderer = TestRenderer.create(
        <StaticRouter location="/" context={{}}>
            <EntryListItem {...props} />
        </StaticRouter>);
    expect(renderer.toJSON()).toMatchSnapshot();
});


it("(3) Nsfw", () => {
    const props = {
        ...defProps,
        entry: {
            ...entryInstance1,
            json_metadata: {
                ...entryInstance1.json_metadata,
                tags: [...entryInstance1.json_metadata.tags, "nsfw"]
            }
        }
    }
    const renderer = TestRenderer.create(
        <StaticRouter location="/" context={{}}>
            <EntryListItem {...props} />
        </StaticRouter>);
    expect(renderer.toJSON()).toMatchSnapshot();
});


it("(4) Nsfw with active user", () => {
    const props = {
        ...defProps,
        entry: {
            ...entryInstance1,
            json_metadata: {
                ...entryInstance1.json_metadata,
                tags: [...entryInstance1.json_metadata.tags, "nsfw"]
            }
        },
        activeUser: activeUserMaker("foo")
    }
    const renderer = TestRenderer.create(
        <StaticRouter location="/" context={{}}>
            <EntryListItem {...props} />
        </StaticRouter>);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(5) Nsfw but allowed", () => {
    const props = {
        ...defProps,
        entry: {
            ...entryInstance1,
            json_metadata: {
                ...entryInstance1.json_metadata,
                tags: [...entryInstance1.json_metadata.tags, "nsfw"]
            }
        },
        global: {
            ...globalInstance,
            nsfw: true
        }
    }
    const renderer = TestRenderer.create(
        <StaticRouter location="/" context={{}}>
            <EntryListItem {...props} />
        </StaticRouter>);
    expect(renderer.toJSON()).toMatchSnapshot();
});
