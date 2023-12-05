import { extractFilterTag } from "./filter-tag-extract";

it("1 - home", () => {
  const res = extractFilterTag("/");
  expect(res).toMatchSnapshot();
});

it("10 - filter", () => {
  const res = extractFilterTag("/trending");
  expect(res).toMatchSnapshot();
});

it("11 - filter", () => {
  const res = extractFilterTag("/hot");
  expect(res).toMatchSnapshot();
});

it("20 - filter + tag", () => {
  const res = extractFilterTag("/trending/esteem");
  expect(res).toMatchSnapshot();
});

it("21 - filter + tag", () => {
  const res = extractFilterTag("/hot/photography");
  expect(res).toMatchSnapshot();
});

it("30 - user", () => {
  const res = extractFilterTag("/@talhasch");
  expect(res).toMatchSnapshot();
});

it("33 - user blog", () => {
  const res = extractFilterTag("/@talhasch/blog");
  expect(res).toMatchSnapshot();
});

it("35 - user posts", () => {
  const res = extractFilterTag("/@talhasch/posts");
  expect(res).toMatchSnapshot();
});

it("40 - user feed", () => {
  const res = extractFilterTag("/@talhasch/feed");
  expect(res).toMatchSnapshot();
});

it("60 - user section", () => {
  const res = extractFilterTag("/@talhasch/comments");
  expect(res).toMatchSnapshot();
});

it("64 - user wallet section", () => {
  const res = extractFilterTag("/@talhasch/wallet");
  expect(res).toMatchSnapshot();
});

it("90 - wrong paths", () => {
  expect(extractFilterTag("/fooo")).toMatchSnapshot();
});

it("91 - wrong paths", () => {
  expect(extractFilterTag("/@qdfqdfqw/bar")).toMatchSnapshot();
});

it("92 - wrong paths", () => {
  expect(extractFilterTag("/foo/bar")).toMatchSnapshot();
});
