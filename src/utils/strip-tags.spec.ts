import { stripTags } from "./strip-tags";

it("strip", () => {
  expect(stripTags("<script>javascript</script> lorem ipsum dolor sit")).toBe(
    "javascript lorem ipsum dolor sit"
  );
  expect(stripTags("<div>div</div> lorem ipsum <strong>dolor</strong> sit")).toBe(
    "div lorem ipsum dolor sit"
  );
});
