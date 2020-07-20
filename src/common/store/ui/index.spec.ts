import reducer, {initialState, toggleLoginAct, toggleSignUpAct} from "./index";

let state = initialState;

it("1- default state", () => {
    expect(state).toMatchSnapshot();
});

it("2- toggleLoginAct", () => {
    state = reducer(state, toggleLoginAct());
    expect(state).toMatchSnapshot();
});

it("3- toggleSignUpAct", () => {
    state = reducer(state, toggleSignUpAct());
    expect(state).toMatchSnapshot();
});

it("4- toggleLoginAct", () => {
    state = reducer(state, toggleLoginAct());
    expect(state).toMatchSnapshot();
});
