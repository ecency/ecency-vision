import React from "react";

import {MuteBtn, DialogBody, DialogMode} from "./index";
import TestRenderer from "react-test-renderer";

import {entryInstance1, communityInstance1, activeUserMaker} from "../../helper/test-helper";

const defProps = {
    entry: {...entryInstance1},
    community: {...communityInstance1},
    activeUser: activeUserMaker("foo"),
    onSuccess: () => {
    }
};

it("(1) Should show 'mute' label", () => {
    const props = {...defProps};
    const renderer = TestRenderer.create(<MuteBtn {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});


it("(2) Should show 'unmute' label", () => {
    const stats = {...entryInstance1.stats!, gray: true};
    const entry = {...entryInstance1, stats};

    const props = {...defProps, entry: entry};
    const renderer = TestRenderer.create(<MuteBtn {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(3) Dialog body for 'mute'", () => {
    const props = {
        entry: {...entryInstance1},
        mode: "mute" as DialogMode,
        onSubmit: () => {
        }
    }
    const renderer = TestRenderer.create(<DialogBody {...props}/>);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(4) Dialog body for 'unmute'", () => {
    const props = {
        entry: {...entryInstance1},
        mode: "unmute" as DialogMode,
        onSubmit: () => {
        }
    }
    const renderer = TestRenderer.create(<DialogBody {...props}/>);
    expect(renderer.toJSON()).toMatchSnapshot();
});
