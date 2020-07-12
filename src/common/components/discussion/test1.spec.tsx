import React from "react";

import Discussion from "./index";

import {Discussion as DiscussionType, SortOrder} from '../../store/discussion/types'

import renderer from "react-test-renderer";

import {createBrowserHistory} from "history";

import {globalInstance, discussionInstace1, dynamicPropsIntance1} from "../../helper/test-helper";

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
    parent,
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

    }
};

const component = renderer.create(<Discussion {...props} />);

it("(1) Full render", () => {
    expect(component.toJSON()).toMatchSnapshot();
});
