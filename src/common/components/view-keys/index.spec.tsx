import React from "react";

import TestRenderer from "react-test-renderer";

import ViewKeysDialog, {ViewKeys} from "./index";

import {activeUserMaker} from "../../helper/test-helper";

it("(1) Default render", () => {
    const props = {
        activeUser: activeUserMaker("foo"),

    };
    const renderer = TestRenderer.create(<ViewKeysDialog {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});


it("(2) Dialog content", () => {
    const props = {
        activeUser: activeUserMaker("foo"),
        onUpdate: () => {
        }
    };
    const renderer = TestRenderer.create(<ViewKeys {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});
