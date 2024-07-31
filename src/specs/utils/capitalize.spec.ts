import { capitalize } from "../../utils/capitalize";

describe("Capitalize", () => {
  it("Should capitalize string", () => {
    expect(capitalize("lorem ipsum")).toBe("Lorem Ipsum");
  });
});
