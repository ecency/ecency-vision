import React from "react";

import TestRenderer from "react-test-renderer";

import ViewKeys from "./index";

import {activeUserMaker} from "../../helper/test-helper";

it("(1) View keys content", () => {
    const props = {
        activeUser: activeUserMaker("foo"),
        onUpdate: () => {
        }
    };
    const renderer = TestRenderer.create(<ViewKeys {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});
