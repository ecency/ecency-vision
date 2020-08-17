import reducer, {initialState, fetchAct, fetchedAct} from "./index";

import {PointTransaction} from "./types";

let state = initialState;

it("1- default state", () => {
    expect(state).toMatchSnapshot();
});

it("2- fetched", () => {
    const list: PointTransaction[] = [
        {
            amount: "0.250",
            created: "2020-08-17T12:52:16.737322+02:00",
            id: 5150947,
            memo: null,
            receiver: null,
            sender: null,
            type: 10,
        },
        {
            amount: "0.750",
            created: "2020-08-17T10:01:22.094361+02:00",
            id: 5149418,
            memo: null,
            receiver: null,
            sender: null,
            type: 120,
        }

    ];
    state = reducer(state, fetchedAct("1.000", "2.000", list));
    expect(state).toMatchSnapshot();
});

it("3- fetch", () => {
    state = reducer(state, fetchAct());
    expect(state).toMatchSnapshot();
});
