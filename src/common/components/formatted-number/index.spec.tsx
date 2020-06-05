import React from "react";

import FormattedNumber from "./index";
import renderer from "react-test-renderer";

it("(1) FormattedNumber", () => {
  const props = {
    value: 1250,
  };

  const component = renderer.create(<FormattedNumber {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) FormattedNumber - with fraction digits", () => {
  const props = {
    value: 1250,
    fractionDigits: 2,
  };

  const component = renderer.create(<FormattedNumber {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(3) FormattedNumber - with prefix", () => {
  const props = {
    value: 100,
    prefix: "$",
  };

  const component = renderer.create(<FormattedNumber {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(4) FormattedNumber - with suffix", () => {
  const props = {
    value: 100,
    prefix: "HIVE",
  };

  const component = renderer.create(<FormattedNumber {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});
