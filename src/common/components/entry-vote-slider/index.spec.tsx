import React from "react";
import VotingSlider from "./index";
import renderer from "react-test-renderer";

const props = {
  value: 100,
  mode: "up",
  setVoteValue: () => {}
};

const component = renderer.create(<VotingSlider {...props} />);

it("(1) Default render", () => {
  expect(component.toJSON()).toMatchSnapshot();
});
