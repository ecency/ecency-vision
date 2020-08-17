import reducer, {initialState, fetchAct, fetchedAct} from "./index";

import {PointTransaction} from "./types";

import {pointTransactionsInstance} from "../../helper/test-helper";

let state = initialState;

it("1- default state", () => {
    expect(state).toMatchSnapshot();
});

it("2- fetched", () => {
    const list = [...pointTransactionsInstance];
    state = reducer(state, fetchedAct("1.000", "2.000", list));
    expect(state).toMatchSnapshot();
});

it("3- fetch", () => {
    state = reducer(state, fetchAct());
    expect(state).toMatchSnapshot();
});
