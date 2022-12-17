import React from "react";
import Announcement from "./index";
import renderer from "react-test-renderer";
import { BrowserRouter } from "react-router-dom";

it("(1) Default render", () => {
  const component = renderer.create(
    <BrowserRouter>
      <Announcement />
    </BrowserRouter>
  );
  expect(component.toJSON()).toMatchSnapshot();
});
