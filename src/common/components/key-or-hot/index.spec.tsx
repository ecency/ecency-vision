import React from "react";

import renderer from "react-test-renderer";

import {KeyOrHot} from "./index";

import {activeUserMaker} from "../../helper/test-helper";

const defProps = {
    activeUser: activeUserMaker("foo"),
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
