import React from "react";
import { WitnessCard } from "./index";
import TestRenderer from "react-test-renderer";
import { globalInstance } from "../../helper/test-helper";
import { BrowserRouter } from "react-router-dom";

const defaultProps = {
  voted: true,
  global: globalInstance,
  witness: "Witness name",
  row: { feed: "2 HBD", priceAge: "2000-10-09T12:00:03" },
  onSuccess: () => {}
};

it("(1) renders witness card successfully", async () => {
  let ComponentToTest = () => (
    <BrowserRouter>
      <WitnessCard {...defaultProps} />
    </BrowserRouter>
  );

  const renderer = TestRenderer.create(<ComponentToTest />);
  expect(renderer).toMatchSnapshot();
});
