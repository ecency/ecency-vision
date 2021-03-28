import reducer, {initialState, fetchAct, setAct} from "./index";
import {logoutAct, loginAct} from "../active-user";

let state = initialState;

it("1- default state", () => {
    expect(state).toMatchSnapshot();
});

it("2- fetchAct", () => {
    state = reducer(state, fetchAct());
    expect(state).toMatchSnapshot();
});

it("3- setAct", () => {
    state = reducer(state, setAct(true));
    expect(state).toMatchSnapshot();
});

it("4- setAct", () => {
    state = reducer(state, setAct(false));
    expect(state).toMatchSnapshot();
});
