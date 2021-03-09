import * as React from 'react';
import EntryHistoryBtn from "./index";

import TestRenderer from "react-test-renderer";

import {entryInstance1, allOver} from "../../helper/test-helper";

let TEST_MODE = 0

jest.mock("../../api/private-api", () => ({
    commentHistory: () =>
        new Promise((resolve) => {
            if (TEST_MODE === 0) {
                resolve({
                    meta: {
                        count: 1
                    }
                });
            }

            if (TEST_MODE === 1) {
                resolve({
                    meta: {
                        count: 2
                    }
                });
            }
        }),
}));


it("(1) Should render null", async () => {
    const props = {entry: entryInstance1};
    const renderer = TestRenderer.create(<EntryHistoryBtn {...props} />);
    await allOver();
    expect(renderer.toJSON()).toMatchSnapshot();
});


it("(2) Should render button", async () => {
    TEST_MODE = 1
    const props = {entry: entryInstance1, append: <span/>};
    const renderer = TestRenderer.create(<EntryHistoryBtn {...props} />);
    await allOver();
    expect(renderer.toJSON()).toMatchSnapshot();
});
