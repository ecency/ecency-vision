import React from "react";

import { WitnessesExtra } from "./index";

import renderer from "react-test-renderer";

import { globalInstance, UiInstance } from "../../helper/test-helper";

const defProps = {
  global: globalInstance,
  users: [],
  activeUser: null,
  ui: UiInstance,
  signingKey: "",
  setActiveUser: () => {},
  updateActiveUser: () => {},
  deleteUser: () => {},
  toggleUIProp: () => {},
  setSigningKey: () => {},
  list: [],
  onAdd: () => {},
  onDelete: () => {}
};

it("(1) Default render", () => {
  const component = renderer.create(<WitnessesExtra {...defProps} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Render with list", () => {
  const props = {
    ...defProps,
    list: ["foo", "bar", "baz"]
  };

  const component = renderer.create(<WitnessesExtra {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});
