import React from "react";

import {DialogBody} from "./index";

import TestRenderer from "react-test-renderer";

const defProps = {
    list: [{
        username: "foo",
        percentage: 10
    }],
    onAdd: () => {
    },
    onDelete: () => {
    }
}

it("(1) Default render", () => {
    const renderer = TestRenderer.create(<DialogBody {...defProps} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) With author", () => {
    const props = {
        ...defProps,
        author: "bar"
    };
    const renderer = TestRenderer.create(<DialogBody {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});
