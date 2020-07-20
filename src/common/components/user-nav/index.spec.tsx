import React from "react";
import {StaticRouter} from "react-router-dom";

import {createBrowserHistory, createLocation} from "history";

import UserNav from "./index";
import renderer from "react-test-renderer";


const defProps = {
    history: createBrowserHistory(),
    location: createLocation({}),
    users: [],
    activeUser: {
        username: "foo",
        data: {
            name: "foo"
        }
    },
    setActiveUser: () => {
    },
    updateActiveUser: () => {
    },
    deleteUser: () => {
    },
    toggleUIProp: () => {

    }
};

it("(1) Default render", () => {
    const component = renderer.create(
        <StaticRouter location="/@username" context={{}}>
            <UserNav {...defProps} />
        </StaticRouter>);
    expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Has rewards ", () => {
    const props = {
        ...defProps,
        ...{
            activeUser: {
                username: "foo",
                data: {
                    name: "foo",
                    reward_sbd_balance: "0.000 HBD",
                    reward_steem_balance: "0.000 HIVE",
                    reward_vesting_steem: "10.207 HIVE",
                    __loaded: true,
                }
            }
        }
    }

    const component = renderer.create(
        <StaticRouter location="/@username" context={{}}>
            <UserNav {...props} />
        </StaticRouter>);
    expect(component.toJSON()).toMatchSnapshot();
});
