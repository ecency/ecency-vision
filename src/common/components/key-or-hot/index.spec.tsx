import React from "react";

import renderer from "react-test-renderer";

import {KeyOrHot} from "./index";

const defProps = {
    signingKey: 'aprivatesigningkey',
    setSigningKey: () => {
    },
    inProgress: false,
    onKey: () => {
    },
    onHot: () => {
    }
};

it("(1) Default render", () => {
    const component = renderer.create(<KeyOrHot {...defProps} />);
    expect(component.toJSON()).toMatchSnapshot();
});
