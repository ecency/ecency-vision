import { initialState } from "./index";

jest.mock("../../util/local-storage", () => ({
  getByPrefix: () => {
    return [
      "eyJ1c2VybmFtZSI6InVzZXIxIiwiYWNjZXNzVG9rZW4iOiJhY2Nlc3MgdG9rZW4iLCJyZWZyZXNoVG9rZW4iOiJyZWZyZXNoIHRva2VuIiwiZXhwaXJlc0luIjoiYSBkYXRlIn0=",
      "eyJ1c2VybmFtZSI6InVzZXIyIiwiYWNjZXNzVG9rZW4iOiJhY2Nlc3MgdG9rZW4iLCJyZWZyZXNoVG9rZW4iOiJyZWZyZXNoIHRva2VuIiwiZXhwaXJlc0luIjoiYSBkYXRlIn0=",
    ];
  },
}));

let state = initialState;

it("1- default state", () => {
  expect(state).toMatchSnapshot();
});
