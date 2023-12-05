import { entryCanonical } from "./entry-canonical";

import { entryInstance1 } from "../helper/test-helper";

it("(1) No app definition in json", () => {
  const entry = { ...entryInstance1, ...{ json_metadata: {} } };
  const result = entryCanonical(entry);
  expect(result).toBe("https://ecency.com/hive/@good-karma/awesome-hive");
});

it("(2) Not valid/registered app", () => {
  const entry = { ...entryInstance1, ...{ json_metadata: { app: "ecency/0.1" } } };
  const result = entryCanonical(entry);
  expect(result).toBe("https://ecency.com/hive/@good-karma/awesome-hive");
});

it("(3) Esteem", () => {
  const result = entryCanonical(entryInstance1);
  expect(result).toBe("https://ecency.com/hive/@good-karma/awesome-hive");
});

it("(4) Hive", () => {
  const entry = { ...entryInstance1, ...{ json_metadata: { app: "hiveblog/0.1" } } };
  const result = entryCanonical(entry);
  expect(result).toBe("https://hive.blog/hive/@good-karma/awesome-hive");
});

it("(5) From canonical field", () => {
  const entry = {
    ...entryInstance1,
    ...{ json_metadata: { canonical_url: "http://foo.bar/baz" } }
  };
  const result = entryCanonical(entry);
  expect(result).toBe("http://foo.bar/baz");
});
