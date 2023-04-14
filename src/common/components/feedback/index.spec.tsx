import React from "react";

import renderer from "react-test-renderer";

import Feedback from "./index";

describe("Feedback component", () => {
  it("renders correctly", () => {
    const props = {
      activeUser: null
    };
    const tree = renderer.create(<Feedback {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
