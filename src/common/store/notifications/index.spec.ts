import reducer, {initialState, fetchAct, fetchedAct, fetchErrorAct, resetAct, setFilterAct, setUnreadCountAct} from "./index";
import {ApiNotification} from "./types";
import {entryInstance1} from "../../helper/test-helper";

let state = initialState;

const notificationInstance1: ApiNotification[] = [
    {
        "id": "v-705431149",
        "type": "vote",
        "source": "fooo10",
        "voter": "fooo10",
        "weight": 10000,
        "author": "good-karma",
        "permlink": "update-on-hivesigner-integration-into-condenser",
        "title": "Update on Hivesigner integration into Condenser",
        "img_url": null,
        "read": 0,
        "timestamp": "2020-07-24T06:50:48+00:00",
        "ts": 1595566248,
        "gk": "2 hours",
        "gkf": true
    },
    {
        "id": "m-49590315",
        "type": "mention",
        "source": "ecency.stats",
        "author": "ecency.stats",
        "account": "good-karma",
        "permlink": "daily-activities-points-2020-07-24",
        "post": true,
        "title": "Daily activities [Points] - Jul 24",
        "img_url": "https://images.ecency.com/0x0/https://img.esteem.app/08zx2x.jpg",
        "read": 0,
        "timestamp": "2020-07-24T01:10:09+00:00",
        "ts": 1595545809,
        "gk": "8 hours",
        "gkf": true
    },
    {
        "id": "f-174272007",
        "type": "follow",
        "source": "fooo10",
        "follower": "fooo10",
        "following": "good-karma",
        "blog": true,
        "read": 0,
        "timestamp": "2020-07-24T06:08:24+00:00",
        "ts": 1595563704,
        "gk": "2 hours",
        "gkf": true
    },
    {
        "id": "f-174258147",
        "type": "unfollow",
        "source": "fooo102",
        "follower": "fooo102",
        "following": "good-karma",
        "blog": false,
        "read": 1,
        "timestamp": "2020-07-19T05:07:09+00:00",
        "ts": 1595128029,
        "gk": "2020-07-19",
        "gkf": false
    },

]

const notificationInstance2: ApiNotification[] = [
    {
        "id": "rr-108155773",
        "type": "reply",
        "source": "dunsky",
        "author": "dunsky",
        "permlink": "re-good-karma-2020721t1915968z",
        "title": "",
        "body": "Testing replies from Ecency web interface \ud83d\ude0e",
        "json_metadata": "{\"tags\": [\"ecency\"], \"app\": \"ecency/0.0.1-vision\", \"format\": \"markdown+html\"}",
        "metadata": {
            "tags": [
                "ecency"
            ],
            "app": "ecency/0.0.1-vision",
            "format": "markdown+html"
        },
        "parent_author": "good-karma",
        "parent_permlink": "re-dunsky-2020713t164324912z",
        "parent_title": null,
        "parent_img_url": null,
        "read": 1,
        "timestamp": "2020-07-21T16:02:00+00:00",
        "ts": 1595340120,
        "gk": "2020-07-21",
        "gkf": false
    },
    {
        "id": "r-10661404",
        "type": "reblog",
        "source": "foo220",
        "account": "foo220",
        "author": "good-karma",
        "permlink": "update-on-hivesigner-integration-into-condenser",
        "title": "Update on Hivesigner integration into Condenser",
        "img_url": null,
        "read": 0,
        "timestamp": "2020-07-23T13:36:06+00:00",
        "ts": 1595504166,
        "gk": "Yesterday",
        "gkf": true
    },
    {
        "id": "t-62284775",
        "type": "transfer",
        "source": "bar212",
        "to": "good-karma",
        "amount": "900.000 HBD",
        "memo": "",
        "read": 1,
        "timestamp": "2020-07-20T09:30:21+00:00",
        "ts": 1595230221,
        "gk": "2020-07-20",
        "gkf": true
    },
]

it("1- default state", () => {
    expect(state).toMatchSnapshot();
});

it("2- fetchAct", () => {
    state = reducer(state, fetchAct());
    expect(state).toMatchSnapshot();
});

it("3- fetchErrorAct", () => {
    state = reducer(state, fetchErrorAct());
    expect(state).toMatchSnapshot();
});

it("4- fetchAct", () => {
    state = reducer(state, fetchAct());
    expect(state).toMatchSnapshot();
});

it("5- fetchedAct", () => {
    state = reducer(state, fetchedAct(notificationInstance1));
    expect(state).toMatchSnapshot();
});

it("6- fetchedAct", () => {
    state = reducer(state, fetchedAct(notificationInstance2));
    expect(state).toMatchSnapshot();
});

it("7- setFilterAct", () => {
    state = reducer(state, setFilterAct("vote"));
    expect(state).toMatchSnapshot();
});

it("8- setUnreadCountAct", () => {
    state = reducer(state, setUnreadCountAct(8));
    expect(state).toMatchSnapshot();
});

it("9- resetAct", () => {
    state = reducer(state, resetAct());
    expect(state).toMatchSnapshot();
});

