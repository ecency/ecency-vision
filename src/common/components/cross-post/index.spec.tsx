import React from "react";

import {CrossPost} from "./index";

import TestRenderer from "react-test-renderer";

import {globalInstance, entryInstance1, activeUserMaker, allOver} from "../../helper/test-helper";

jest.mock("../../api/bridge", () => ({
    getSubscriptions: () =>
        new Promise((resolve) => {
            resolve(
                [
                    ["hive-125125", "Ecency"],
                    ["hive-252252", "Foo"]
                ]
            );
        }),
}));


it("(1) Default render", async () => {
    const props = {
        global: globalInstance,
        activeUser: activeUserMaker("foo"),
        entry: entryInstance1,
        onSuccess: () => {
        },
        onHide: () => {
        }
    };

    const renderer = TestRenderer.create(<CrossPost {...props} />);
    await allOver();
    expect(renderer.toJSON()).toMatchSnapshot();
});
