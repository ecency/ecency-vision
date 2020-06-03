import React from "react";

import ProfileCard from "./index";
import renderer from "react-test-renderer";

import { accountInstance1 } from "../../helper/test-helper";

jest.mock("../../constants/defaults.json", () => ({
  imageServer: "https://images.esteem.app",
  base: "https://ecency.com"
}));

it("(1) Default render", () => {
  const props = {
    account: { ...accountInstance1 },
  };

  // @ts-ignore
  const component = renderer.create(<ProfileCard {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});
