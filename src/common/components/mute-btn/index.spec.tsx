import React from "react";

import {MuteBtn, DialogBody} from "./index";
import TestRenderer from "react-test-renderer";

import {entryInstance1, communityInstance1, activeUserMaker} from "../../helper/test-helper";
import {Entry, EntryStat} from "../../store/entries/types";

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
        inProgress: false,
        onSubmit: () => {
        }
    }
    const renderer = TestRenderer.create(<DialogBody {...props}/>);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(4) Dialog body for 'unmute'", () => {
    const stats: EntryStat = {
        hide: false,
        gray: true,
        total_votes: 10,
        flag_weight: 1.0,
    }

    const props = {
        entry: {
            ...entryInstance1,
            stats
        },
        inProgress: false,
        onSubmit: () => {
        }
    }
    const renderer = TestRenderer.create(<DialogBody {...props}/>);
    expect(renderer.toJSON()).toMatchSnapshot();
});
