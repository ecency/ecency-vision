import React from "react";
import {StaticRouter} from "react-router-dom";
import TestRenderer from "react-test-renderer";
import {createBrowserHistory, createLocation,} from "history";

import NavBar from "./index";

import {Theme} from "../../../../common/store/global/types";

import {globalInstance, UiInstance, notificationsInstance1, activeUserInstance, dynamicPropsIntance1} from "../../../../common/helper/test-helper";
import {initialState as trendingTags} from "../../../../common/store/trending-tags";

const defProps = {
    history: createBrowserHistory(),
    location: createLocation({}),
    global: globalInstance,
    dynamicProps: dynamicPropsIntance1,
    users: [],
    activeUser: null,
    ui: UiInstance,
    notifications: notificationsInstance1,
    trendingTags,
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
    setLang: () => {
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

it("(2) With updater", () => {
    const props = {
        ...defProps,
        ...{
            global: {
                ...globalInstance,
                newVersion: '3.5.1'
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

it("(3) Night Theme", () => {
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


it("(4) With active user", () => {
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

it("(5) With active user && usePrivate = false", () => {
    const props = {
        ...defProps,
        ...{
            activeUser: {...activeUserInstance}
        },
        global: {
            ...globalInstance,
            usePrivate: false
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

