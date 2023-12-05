import { capitalize } from "./capitalize";

it("Should capitalize string", () => {
  expect(capitalize("lorem ipsum")).toBe("Lorem Ipsum");
});
