import React from "react";
import {StaticRouter} from "react-router-dom";
import TestRenderer from "react-test-renderer";
import {createBrowserHistory, createLocation} from "history";

import NavBar from "./index";

import {Theme} from "../../../../common/store/global/types";

import {globalInstance, TrendingTagsInstance, UiInstance, notificationsInstance1, activeUserInstance} from "../../../../common/helper/test-helper";


const defProps = {
    history: createBrowserHistory(),
    location: createLocation({}),
    global: globalInstance,
    users: [],
    activeUser: null,
    ui: UiInstance,
    notifications: notificationsInstance1,
    fetchTrendingTags: () => {
    },
    toggleTheme: () => {
    },
    addUser: () => {
    },
    setActiveUser: () => {
    },
    updateActiveUser: () => {
    },
    addAccount: () => {
    },
    deleteUser: () => {
    },
    fetchNotifications: () => {
    },
    fetchUnreadNotificationCount: () => {
    },
    setNotificationsFilter: () => {
    },
    markNotifications: () => {
    },
    toggleUIProp: () => {
    },
    dismissNewVersion: () => {
    },
    reloadFn: () => {
    },
    reloading: false

};

it("(1) Default render", () => {
    const component = <NavBar {...defProps} />;

    const renderer = TestRenderer.create(
        <StaticRouter location="/" context={{}}>
            {component}
        </StaticRouter>
    );

    expect(renderer.toJSON()).toMatchSnapshot();
});

