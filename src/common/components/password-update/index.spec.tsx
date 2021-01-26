import React from "react";

import TestRenderer from "react-test-renderer";

import PasswordUpdateDialog, {PasswordUpdate} from "./index";

import {activeUserMaker} from "../../helper/test-helper";

it("(1) Default render", () => {
    const props = {
        activeUser: activeUserMaker("foo"),

    };
    const renderer = TestRenderer.create(<PasswordUpdateDialog {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});


it("(2) Dialog content", () => {
    const props = {
        activeUser: activeUserMaker("foo"),
        onUpdate: () => {
        }
    };
    const renderer = TestRenderer.create(<PasswordUpdate {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});
