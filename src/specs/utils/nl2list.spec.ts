import { nl2list } from "../../utils/nl2list";

describe("NL to list", () => {
  it("nl2list", () => {
    expect(nl2list("a \n multi line \n\r text")).toStrictEqual(["a", "multi line", "text"]);
  });
});
