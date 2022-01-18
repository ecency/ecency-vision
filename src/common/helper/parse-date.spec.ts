import parseDate from "./parse-date";

it("Parse hive date", () => {
  const input = "2018-08-28T22:10:21";
  expect(parseDate(input).toUTCString()).toMatchSnapshot();
});
