import React from "react";
import {StaticRouter} from "react-router-dom";
import TestRenderer from "react-test-renderer";
import {createBrowserHistory, createLocation} from "history";

import NavBar from "./index";

import {Theme} from "../../store/global/types";

import {globalInstance, TrendingTagsInstance, UiInstance, notificationsInstance1, activeUserInstance} from "../../helper/test-helper";


const defProps = {
    history: createBrowserHistory(),
    location: createLocation({}),
    global: globalInstance,
    trendingTags: TrendingTagsInstance,
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
    muteNotifications: () => {
    },
    unMuteNotifications: () => {
    },
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


it("(2) Night Theme", () => {
    const props = {
        ...defProps,
        ...{
            global: {
                ...globalInstance,
                theme: Theme.night
            }
        }
    }
    const component = <NavBar {...props} />;

    const renderer = TestRenderer.create(
        <StaticRouter location="/" context={{}}>
            {component}
        </StaticRouter>
    );

    expect(renderer.toJSON()).toMatchSnapshot();
});


it("(3) With active user", () => {
    const props = {
        ...defProps,
        ...{
            activeUser: {...activeUserInstance}
        }
    }
    const component = <NavBar {...props} />;

    const renderer = TestRenderer.create(
        <StaticRouter location="/" context={{}}>
            {component}
        </StaticRouter>
    );

    expect(renderer.toJSON()).toMatchSnapshot();
});
