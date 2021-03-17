import reducer, {initialState, resetAct, fetchAct, fetchedAct, errorAct} from "./index";

import {pointTransactionsInstance} from "../../helper/test-helper";

let state = initialState;

it("1- default state", () => {
    expect(state).toMatchSnapshot();
});

it("2- fetchAct", () => {
    state = reducer(state, fetchAct());
    expect(state).toMatchSnapshot();
});

it("3- fetched", () => {
    const list = [...pointTransactionsInstance];
    state = reducer(state, fetchedAct("1.000", "2.000", list));
    expect(state).toMatchSnapshot();
});

it("4- resetAct", () => {
    state = reducer(state, resetAct());
    expect(state).toMatchSnapshot();
});

it("5- fetchAct", () => {
    state = reducer(state, fetchAct());
    expect(state).toMatchSnapshot();
});

it("6- errorAct", () => {
    state = reducer(state, errorAct());
    expect(state).toMatchSnapshot();
});
