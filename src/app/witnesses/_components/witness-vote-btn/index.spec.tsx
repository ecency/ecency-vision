import React from "react";

import { WitnessVoteBtn } from "./index";

import renderer from "react-test-renderer";

import { globalInstance, UiInstance } from "../../helper/test-helper";

const defProps = {
  global: globalInstance,
  users: [],
  activeUser: null,
  ui: UiInstance,
  signingKey: "",
  voted: false,
  witness: "foo",
  setActiveUser: () => {},
  updateActiveUser: () => {},
  deleteUser: () => {},
  toggleUIProp: () => {},
  setSigningKey: () => {},
  onSuccess: () => {}
};

it("(1) Default render", () => {
  const component = renderer.create(<WitnessVoteBtn {...defProps} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Voted", () => {
  const props = {
    ...defProps,
    voted: true
  };
  const component = renderer.create(<WitnessVoteBtn {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(3) Voted and with empty witness", () => {
  const props = {
    ...defProps,
    voted: true,
    witness: ""
  };
  const component = renderer.create(<WitnessVoteBtn {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});
