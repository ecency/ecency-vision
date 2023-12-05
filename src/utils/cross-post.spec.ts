import { crossPostMessage, makeCrossPostMessage } from "./cross-post";

import { entryInstance1 } from "./test-helper";

it("1 - Invalid", () => {
  expect(crossPostMessage("")).toMatchSnapshot();
  expect(crossPostMessage("lorem ipsum dolor sit amet")).toMatchSnapshot();
});

it("2 - Valid", () => {
  expect(
    crossPostMessage(
      "This is a cross post of [@foo/bar-baz](/hive-125125/@foo/bar-baz) by @romytokic.<br><br>This part is message to community."
    )
  ).toMatchSnapshot();
});

it("3- Make cross post body", () => {
  expect(
    makeCrossPostMessage(entryInstance1, "foo", "lorem ipsum dolor sit amet")
  ).toMatchSnapshot();
});
