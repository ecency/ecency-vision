import React from "react";

import ProfileCover from "./index";
import renderer from "react-test-renderer";

import { Theme } from "../../store/global/types";
import { Account } from "../../store/accounts/types";

import { globalInstance } from "../../helper/test-helper";

jest.mock("../../constants/defaults.json", () => ({
  imageServer: "https://images.esteem.app",
}));

it("(1) Render with loaded account object", () => {
  const account: Account = {
    name: "user1",
    profile: {
      cover_image: "https://img.esteem.app/rwd380.jpg",
    },
    __loaded: true,
  };

  const props = {
    global: { ...globalInstance },
    account,
  };

  const component = renderer.create(<ProfileCover {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Render with mot loaded account object", () => {
  const account: Account = {
    name: "user1",
  };

  const props = {
    global: { ...globalInstance },
    account,
  };

  const component = renderer.create(<ProfileCover {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(3) No bg image - Day theme", () => {
  const account: Account = {
    name: "user1",
    profile: {},
    __loaded: true,
  };

  const props = {
    global: { ...globalInstance },
    account,
  };

  const component = renderer.create(<ProfileCover {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(4) No bg image - Night theme", () => {
  const account: Account = {
    name: "user1",
    profile: {},
    __loaded: true,
  };

  const props = {
    global: { ...globalInstance, ...{ theme: Theme.night } },
    account,
  };

  const component = renderer.create(<ProfileCover {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});
