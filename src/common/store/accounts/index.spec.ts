import reducer, {initialState, addAct} from "./index";

import {fullAccountInstance} from "../../helper/test-helper";

import {Accounts} from "./types";

let state: Accounts = [];

it("1- default state", () => {
    expect(state).toMatchSnapshot();
});

it("2- addAct - should add account", () => {
    state = reducer(state, addAct({name: "user1"}));
    expect(state).toMatchSnapshot();
});

it("3- addAct - should add account", () => {
    state = reducer(state, addAct({name: "user2"}));
    expect(state).toMatchSnapshot();
});

it("4- addAct - should update account", () => {
    state = reducer(state, addAct({...fullAccountInstance, name: "user1"}));
    expect(state).toMatchSnapshot();
});
