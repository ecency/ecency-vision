import React from "react";

import {StaticRouter} from "react-router-dom";
import TestRenderer from "react-test-renderer";

import Intro from "./index";

import {globalInstance} from "../../helper/test-helper";

it("(1) Render", () => {
    const props = {
        global: globalInstance,
        hideIntro: () => {
        }
    };
    const renderer = TestRenderer.create(
        <StaticRouter location="/" context={{}}>
            <Intro {...props}/>
        </StaticRouter>);
    expect(renderer.toJSON()).toMatchSnapshot();
});

