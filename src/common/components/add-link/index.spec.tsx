import React from "react";

import {AddLink} from "./index";

import TestRenderer from "react-test-renderer";

it("(1) Default render", async () => {
    const props = {
        onHide: () => {
        },
        onSubmit: () => {
        }
    };

    const renderer = TestRenderer.create(<AddLink {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});



