import { formattedNumber } from "./formatted-number";

it("(1) formattedNumber", () => {
  const res = formattedNumber(1250);
  expect(res).toMatchSnapshot();
});

it("(2) formattedNumber - with fraction digits", () => {
  const opts = {
    value: 1250,
    fractionDigits: 2
  };

  const res = formattedNumber(1250, opts);
  expect(res).toMatchSnapshot();
});

it("(3) formattedNumber - with prefix", () => {
  const opts = {
    prefix: "$"
  };

  const res = formattedNumber(100, opts);
  expect(res).toMatchSnapshot();
});

it("(4) formattedNumber - with suffix", () => {
  const opts = {
    suffix: "TL"
  };

  const res = formattedNumber(100, opts);
  expect(res).toMatchSnapshot();
});
