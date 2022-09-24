import React from "react";

import {WitnessesProxy} from "./index";

import renderer from "react-test-renderer";

import {globalInstance, UiInstance} from "../../helper/test-helper";

const defProps = {
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
    toggleUIProp: () => {
    },
    setSigningKey: () => {
    },
    onDone: () => {
    }
}

it("(1) Default render", () => {
    const component = renderer.create(<WitnessesProxy {...defProps} />);
    expect(component.toJSON()).toMatchSnapshot();
});
