import React from "react";

import {PinBtn} from "./index";
import TestRenderer from "react-test-renderer";

import {entryInstance1, communityInstance1, activeUserMaker, allOver} from "../../helper/test-helper";

let TEST_MODE = 0;

jest.mock("../../api/bridge", () => ({
    getPostsRanked: () =>
        new Promise((resolve) => {
            if (TEST_MODE === 0) {
                resolve([]);
            }

            if (TEST_MODE === 1) {
                const entry = {
                    ...entryInstance1,
                    stats: {...entryInstance1.stats, is_pinned: true}
                }
                resolve([entry]);
            }
        }),
}));

const defProps = {
    entry: {...entryInstance1},
    community: {...communityInstance1},
    activeUser: activeUserMaker("foo"),
    onSuccess: () => {
    }
};

it("(1) Should show 'pin' label", async () => {
    const props = {...defProps};
    const renderer = TestRenderer.create(<PinBtn {...props} />);
    await allOver();
    expect(renderer.toJSON()).toMatchSnapshot();
});


it("(2) Should show 'unpin' label", async() => {
    TEST_MODE = 1;
    const renderer = TestRenderer.create(<PinBtn {...defProps} />);
    await allOver();
    expect(renderer.toJSON()).toMatchSnapshot();
});
