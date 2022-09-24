import reducer, {initialState, fetchAct, fetchedAct, addAct, deleteAct} from "./index";
import {logoutAct, loginAct} from "../active-user";

let state = initialState;

it("1- default state", () => {
    expect(state).toMatchSnapshot();
});

it("2- fetchAct", () => {
    state = reducer(state, fetchAct());
    expect(state).toMatchSnapshot();
});

it("3- fetchedAct", () => {
    const items = [
        {author: "foo", permlink: "bar"},
        {author: "baz", permlink: "gaz"}
    ]
    state = reducer(state, fetchedAct(items));
    expect(state).toMatchSnapshot();
});

it("4- addAct", () => {
    const item = {author: "lorem", permlink: "ipsum"};

    state = reducer(state, addAct(item));
    expect(state).toMatchSnapshot();
});

it("5- deleteAct", () => {
    const item = {author: "baz", permlink: "gaz"};

    state = reducer(state, deleteAct(item));
    expect(state).toMatchSnapshot();
});

it("6- logoutAct", () => {
    state = reducer(state, logoutAct());
    expect(state).toMatchSnapshot();
});

it("7- fetchAct", () => {
    state = reducer(state, fetchAct());
    expect(state).toMatchSnapshot();
});

it("8- loginAct", () => {
    state = reducer(state, loginAct());
    expect(state).toMatchSnapshot();
});
