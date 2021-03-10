import reducer, { initialState, reloadAct } from "./index";

jest.mock("../../util/local-storage", () => ({
  getByPrefix: () => {
    return [
      "eyJ1c2VybmFtZSI6InVzZXIxIiwiYWNjZXNzVG9rZW4iOiJhY2Nlc3MgdG9rZW4iLCJyZWZyZXNoVG9rZW4iOiJyZWZyZXNoIHRva2VuIiwiZXhwaXJlc0luIjoiYSBkYXRlIiwicG9zdGluZ0tleSI6bnVsbH0=",
      "eyJ1c2VybmFtZSI6InVzZXIyIiwiYWNjZXNzVG9rZW4iOiJhY2Nlc3MgdG9rZW4iLCJyZWZyZXNoVG9rZW4iOiJyZWZyZXNoIHRva2VuIiwiZXhwaXJlc0luIjoiYSBkYXRlIiwicG9zdGluZ0tleSI6bnVsbH0=",
    ];
  },
}));

let state = initialState;

it("1- default state", () => {
  expect(state).toMatchSnapshot();
});

it("2- reloadAct", () => {
  state = reducer(state, reloadAct());
  expect(state).toMatchSnapshot();
});
