import reducer, {initialState, fetchAct, fetchedAct, fetchErrorAct, setFilterAct, setUnreadCountAct} from "./index";

import {apiNotificationList1, apiNotificationList2} from "../../helper/test-helper";

import {logoutAct} from "../active-user";

let state = initialState;

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
    state = reducer(state, fetchedAct(apiNotificationList1));
    expect(state).toMatchSnapshot();
});

it("6- fetchedAct", () => {
    state = reducer(state, fetchedAct(apiNotificationList2));
    expect(state).toMatchSnapshot();
});

it("7- setFilterAct", () => {
    state = reducer(state, setFilterAct("rvotes"));
    expect(state).toMatchSnapshot();
});

it("8- setUnreadCountAct", () => {
    state = reducer(state, setUnreadCountAct(8));
    expect(state).toMatchSnapshot();
});


it("9- logoutAct", () => {
    state = reducer(state, logoutAct());
    expect(state).toMatchSnapshot();
});

