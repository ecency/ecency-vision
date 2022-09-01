import truncate from "./truncate";

it("truncate", () => {
  expect(truncate("lorem ipsum dolor sit amet", 10)).toBe("lorem ipsu...");
});

it("truncate", () => {
  expect(truncate("lore", 5)).toBe("lore");
});
