import isEmptyDate from "./is-empty-date";

describe("isEmptyDate", () => {
  it("should be true", () => {
    expect(isEmptyDate("1969-12-31T23:59:59")).toBe(true);
  });

  it("should be true", () => {
    expect(isEmptyDate("1970-01-01T00:00:00")).toBe(true);
  });

  it("should be false", () => {
    expect(isEmptyDate("2019-01-14T13:13:27")).toBe(false);
  });
});
