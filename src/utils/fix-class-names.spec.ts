import { fixClassNames } from "./fix-class-names";

it("Should fix class name", () => {
  expect(fixClassNames("lorem ipsum dolor sit  amet foo      bar baz")).toBe(
    "lorem ipsum dolor sit amet foo bar baz"
  );
});
