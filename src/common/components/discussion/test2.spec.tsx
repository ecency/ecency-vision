import React from "react";

import Discussion from "./index";

import {Discussion as DiscussionType, SortOrder} from '../../store/discussion/types'

import renderer from "react-test-renderer";

import {createBrowserHistory} from "history";

import {globalInstance, discussionInstace1, dynamicPropsIntance1} from "../../helper/test-helper";

const [parent] = discussionInstace1;

const discussion: DiscussionType = {
    list: [],
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
    parent: {...parent, children: 0},
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

    }
};

const component = renderer.create(<Discussion {...props} />);

it("(1) Empty list", () => {
    expect(component.toJSON()).toMatchSnapshot();
});
