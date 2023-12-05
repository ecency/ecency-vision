import { cleanString } from "./clean-string";

it("Should clean string", () => {
  expect(cleanString("Posts about Pubs\n")).toBe("Posts about Pubs");
});
