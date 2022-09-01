import { parseUrl } from "./misc";

it("1 - Invalid", () => {
  expect(parseUrl("foo")).toMatchSnapshot();
  expect(parseUrl("")).toMatchSnapshot();
  expect(parseUrl(" foo  https://ecency.com bar ")).toMatchSnapshot();
});

it("2 - Valid", () => {
  expect(parseUrl("https://ecency.com")).toMatchSnapshot();
  expect(parseUrl("  https://ecency.com  ")).toMatchSnapshot();
  expect(
    parseUrl("https://ecency.com/hive-125125/@ecency/onboarding-more-users-join-us")
  ).toMatchSnapshot();
});
