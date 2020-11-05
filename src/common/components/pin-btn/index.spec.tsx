import React from "react";

import {PinBtn} from "./index";
import TestRenderer from "react-test-renderer";

import {entryInstance1, communityInstance1, activeUserMaker} from "../../helper/test-helper";

const defProps = {
    entry: {...entryInstance1},
    community: {...communityInstance1},
    activeUser: activeUserMaker("foo"),
    onSuccess: () => {
    }
};

it("(1) Should show 'pin' label", () => {
    const props = {...defProps};
    const renderer = TestRenderer.create(<PinBtn {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});


it("(2) Should show 'unpin' label", () => {
    const stats = {...entryInstance1.stats!, is_pinned: true};
    const entry = {...entryInstance1, stats};

    const props = {...defProps, entry: entry};
    const renderer = TestRenderer.create(<PinBtn {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});
