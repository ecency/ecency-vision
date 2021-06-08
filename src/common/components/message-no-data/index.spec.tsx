import React from "react";
import TestRenderer from "react-test-renderer";
import MessageNoData from "./index";

it("Renders a message", () => {
    const renderer = TestRenderer.create(
        <MessageNoData>No data found!</MessageNoData>);
    expect(renderer.toJSON()).toMatchSnapshot();
});

