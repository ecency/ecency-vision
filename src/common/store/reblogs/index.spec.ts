import reducer, { initialState } from "./index";

jest.mock("../../util/local-storage", () => ({
  get: () => {
    return [
      {
        account: "lorem",
        author: "ipsum",
        permlink: "dolor",
      },
      {
        account: "foo",
        author: "bar",
        permlink: "baz",
      },
    ];
  },
}));

let state = initialState;

it("1- default state", () => {
  expect(state).toMatchSnapshot();
});
