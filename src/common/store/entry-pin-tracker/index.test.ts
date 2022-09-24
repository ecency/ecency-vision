import reducer, {initialState, fetchAct, setAct} from "./index";
import {entryInstance1} from "../../helper/test-helper";

const entry = {...entryInstance1};
const entry2 = {...entryInstance1, ...{author: "foo", "permlink": "bar"}};

let state = initialState;

it("1- default state", () => {
    expect(state).toMatchSnapshot();
});

it("2- fetchAct", () => {
    state = reducer(state, fetchAct(entry));
    expect(state).toMatchSnapshot();
});

it("3- fetchAct", () => {
    state = reducer(state, fetchAct(entry2));
    expect(state).toMatchSnapshot();
});

it("4- setAct", () => {
    state = reducer(state, setAct(entry, true));
    expect(state).toMatchSnapshot();
});

it("5- setAct", () => {
    state = reducer(state, setAct(entry, false));
    expect(state).toMatchSnapshot();
});
