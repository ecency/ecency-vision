import React from "react";

import Discussion from "./index";

import {Discussion as DiscussionType, SortOrder} from '../../store/discussion/types'
import {UiInstance} from "../../helper/test-helper";

import renderer from "react-test-renderer";

import {createBrowserHistory, createLocation} from "history";

import {globalInstance, discussionInstace1, dynamicPropsIntance1, activeUserMaker} from "../../helper/test-helper";

const [parent] = discussionInstace1;

const discussion: DiscussionType = {
    list: [],
    loading: false,
    error: false,
    order: SortOrder.trending
}

const defProps = {
    history: createBrowserHistory(),
    location: createLocation({}),
    global: globalInstance,
    dynamicProps: dynamicPropsIntance1,
    users: [],
    activeUser: null,
    parent: {...parent, children: 0},
    community: null,
    discussion,
    ui: UiInstance,
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


it("(1) Empty list with no active user", () => {
    const component = renderer.create(<Discussion {...defProps} />);
    expect(component.toJSON()).toMatchSnapshot();
});


it("(2) Empty list with active user", () => {
    const props = {
        ...defProps,
        activeUser: activeUserMaker("foo")
    }
    const component = renderer.create(<Discussion {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
});
