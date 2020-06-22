import reducer, { initialState, addAct, refreshAct } from "./index";

jest.mock("../../util/local-storage", () => ({
  getByPrefix: () => {
    return [
      {
        username: "user1",
        accessToken: "access token",
        refreshToken: "refresh token",
        expiresIn: "a date",
      },
      {
        username: "user2",
        accessToken: "access token",
        refreshToken: "refresh token",
        expiresIn: "a date",
      },
    ];
  },
}));

let state = initialState;

it("1- default state", () => {
  expect(state).toMatchSnapshot();
});
