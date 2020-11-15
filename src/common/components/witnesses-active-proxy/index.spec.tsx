import React from "react";

import {createBrowserHistory} from "history";

import {WitnessesActiveProxy} from "./index";

import renderer from "react-test-renderer";

import {globalInstance, UiInstance} from "../../helper/test-helper";

const defProps = {
    history: createBrowserHistory(),
    global: globalInstance,
    users: [],
    activeUser: null,
    ui: UiInstance,
    signingKey: "",
    setActiveUser: () => {
    },
    updateActiveUser: () => {
    },
    deleteUser: () => {
    },
    addAccount: () => {
    },
    toggleUIProp: () => {
    },
    setSigningKey: () => {
    },
    username: "foo",
    onDone: () => {
    }
}

it("(1) Default render", () => {
    const component = renderer.create(<WitnessesActiveProxy {...defProps} />);
    expect(component.toJSON()).toMatchSnapshot();
});
