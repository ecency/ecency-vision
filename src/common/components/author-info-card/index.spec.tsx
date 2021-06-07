import React from "react";

import AuthorCard from "./index";

import TestRenderer from "react-test-renderer";

import {entryInstance1, globalInstance} from "../../helper/test-helper";


it("(1) Default render", async () => {
    const props = {
        match: {
            params: {
                username: "@demodemo"
            }
        },
        entry: entryInstance1,
        global: globalInstance, 
        history: {},
        location: "",
        toggleTheme: () => {},
    };

    const renderer =  TestRenderer.create(<AuthorCard {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});
