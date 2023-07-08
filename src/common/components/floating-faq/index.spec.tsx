import React from "react";
import FloatingFAQ from "./index";
import renderer from "react-test-renderer";
import { BrowserRouter } from "react-router-dom";

it("(1) Default render", () => {
  const props = {};
  const component = renderer.create(
    <BrowserRouter>
      <FloatingFAQ {...props} />
    </BrowserRouter>
  );
  expect(component.toJSON()).toMatchSnapshot();
});
