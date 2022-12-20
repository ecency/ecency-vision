import React from "react";
import Announcement from "./index";
import renderer from "react-test-renderer";
import { BrowserRouter } from "react-router-dom";

it("(1) Default render", () => {
  const props = {
    activeUser: null
  };
  const component = renderer.create(
    <BrowserRouter>
      <Announcement {...props} />
    </BrowserRouter>
  );
  expect(component.toJSON()).toMatchSnapshot();
});
