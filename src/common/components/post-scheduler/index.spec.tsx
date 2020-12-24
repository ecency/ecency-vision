import React from "react";

import moment from "moment";

import PostSchedulerDialog from "./index";

import TestRenderer from "react-test-renderer";


const defProps = {
    date: null,
    onChange: () => {
    },
    onHide: () => {
    }
}

it("(1) Render with null date", () => {
    const renderer = TestRenderer.create(<PostSchedulerDialog {...defProps} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Render with date", () => {
    const props = {
        ...defProps,
        date: moment("2020-12-12T12:12:12")
    }
    const renderer = TestRenderer.create(<PostSchedulerDialog {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});
