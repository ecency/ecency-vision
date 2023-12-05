import isCommunity from "./is-community";

describe("isCommunity", () => {
  it("should be true", () => {
    expect(isCommunity("hive-125125")).toBe(true);
  });

  it("should be false", () => {
    expect(isCommunity("hive-gaming")).toBe(false);
  });

  it("should be false", () => {
    expect(isCommunity("foo-123123")).toBe(false);
  });
});
