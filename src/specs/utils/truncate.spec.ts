import { truncate } from "../../utils/truncate";

describe("Truncate", () => {
  it("(1) truncate", () => {
    expect(truncate("lorem ipsum dolor sit amet", 10)).toBe("lorem ipsu...");
  });

  it("(2) truncate", () => {
    expect(truncate("lore", 5)).toBe("lore");
  });
});
