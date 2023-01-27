import React from "react";
import renderer from "react-test-renderer";
import { BrowserRouter } from "react-router-dom";
import { AvailableCredits } from "./index";
import { RcOperation } from "../../api/bridge";

it("(1) Default render", () => {
  const props = {
    username: "test",
    operation: "comment_operation" as RcOperation
  };
  const component = renderer.create(
    <BrowserRouter>
      <AvailableCredits {...props} />
    </BrowserRouter>
  );
  expect(component.toJSON()).toMatchSnapshot();
});
