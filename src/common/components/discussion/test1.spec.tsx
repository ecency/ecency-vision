import React from "react";

import Discussion from "./index";

import {Discussion as DiscussionType, SortOrder} from '../../store/discussion/types';

import renderer from "react-test-renderer";

import {createBrowserHistory} from "history";

import {globalInstance, discussionInstace1, dynamicPropsIntance1, communityInstance1, activeUserMaker, UiInstance} from "../../helper/test-helper";

jest.mock("moment", () => () => ({
    fromNow: () => "3 days ago",
    format: (f: string, s: string) => "2020-01-01 23:12:00",
}));

const [parent] = discussionInstace1;
const [, ...replies] = discussionInstace1;

const discussion: DiscussionType = {
    list: replies,
    loading: false,
    error: false,
    order: SortOrder.trending
}

const props = {
    history: createBrowserHistory(),
    global: globalInstance,
    dynamicProps: dynamicPropsIntance1,
    users: [],
    activeUser: null,
    ui: UiInstance,
    parent,
    community: null,
    discussion,
    addAccount: () => {
    },
    setActiveUser: () => {
    },
    updateActiveUser: () => {
    },
    deleteUser: () => {
    },
    fetchDiscussion: () => {
    },
    sortDiscussion: () => {
    },
    resetDiscussion: () => {
    },
    updateReply: () => {
    },
    addReply: () => {
    },
    deleteReply: () => {
    },
    toggleUIProp: () => {
    }
};

it("(1) Full render", () => {
    const component = renderer.create(<Discussion {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Show mute button, muted comment", () => {
    let [reply] = replies;
    reply = {...reply, stats: {...reply.stats, gray: true}}

    const discussion: DiscussionType = {
        list: [reply, replies[1]],
        loading: false,
        error: false,
        order: SortOrder.trending
    }

    const nProps = {
        ...props,
        discussion,
        activeUser: activeUserMaker("hive-148441"),
        community: communityInstance1
    }
    const component = renderer.create(<Discussion {...nProps} />);
    expect(component.toJSON()).toMatchSnapshot();
});
