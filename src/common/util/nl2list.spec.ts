import nl2br from "./nl2list";

it("nl2list", () => {
  expect(nl2br("a \n multi line \n\r text")).toStrictEqual(["a", "multi line", "text"]);
});
