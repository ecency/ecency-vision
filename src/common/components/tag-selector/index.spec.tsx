import React from "react";

import {TagSelector} from "./index";
import TestRenderer from "react-test-renderer";

import {createBrowserHistory} from "history";

import {globalInstance, TrendingTagsInstance} from "../../helper/test-helper";

it("(1) No tags", () => {
    const props = {
        global: globalInstance,
        history: createBrowserHistory(),
        trendingTags: TrendingTagsInstance,
        tags: [],
        maxItem: 10,
        onChange: () => {
        },
        onValid: () => {            
        },
    };

    const component = TestRenderer.create(<TagSelector {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
});

it("(2) With tags", () => {
    const props = {
        global: globalInstance,
        history: createBrowserHistory(),
        trendingTags: TrendingTagsInstance,
        tags: ["foo", "bar"],
        maxItem: 10,
        onChange: () => {
        },
        onValid: () => {            
        },
    };

    const component = TestRenderer.create(<TagSelector {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
});

it("(3) No tags with focus", () => {
    const props = {
        global: globalInstance,
        history: createBrowserHistory(),
        trendingTags: TrendingTagsInstance,
        tags: [],
        maxItem: 10,
        onChange: () => {
        },
        onValid: () => {            
        },
    };

    const component = TestRenderer.create(<TagSelector {...props} />);

    const instance: any = component.getInstance();
    instance.setState({hasFocus: true});

    expect(component.toJSON()).toMatchSnapshot();
});
