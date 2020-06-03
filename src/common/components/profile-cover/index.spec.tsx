import React from "react";

import ProfileCover from "./index";
import renderer from "react-test-renderer";

import { Theme } from "../../store/global/types";

import { globalInstance } from "../../helper/test-helper";

import { accountInstance1 } from "../../helper/test-helper";

jest.mock("../../constants/defaults.json", () => ({
  imageServer: "https://images.esteem.app",
}));

it("(1) Default render", () => {
  const props = {
    global: { ...globalInstance },
    account: { ...accountInstance1 },
  };

  // @ts-ignore
  const component = renderer.create(<ProfileCover {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) No bg image - Day theme", () => {
  const props = {
    global: { ...globalInstance },
    account: { ...accountInstance1, ...{ profile: {} } },
  };

  // @ts-ignore
  const component = renderer.create(<ProfileCover {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(3) No bg image - Night theme", () => {
  const props = {
    global: { ...globalInstance, ...{ theme: Theme.night } },
    account: { ...accountInstance1, ...{ profile: {} } },
  };

  // @ts-ignore
  const component = renderer.create(<ProfileCover {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});
