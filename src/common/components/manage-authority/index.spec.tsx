import React from "react";
import ManageAuthorities from "./index";
import renderer from "react-test-renderer";
import { BrowserRouter } from "react-router-dom";
import { globalInstance } from "../../helper/test-helper";

it("(1) Default render", () => {
  const props = {
    global: globalInstance,
    activeUser: null,
    signingKey: "",
    setSigningKey: () => {}
  };
  const component = renderer.create(
    <BrowserRouter>
      <ManageAuthorities {...props} />
    </BrowserRouter>
  );
  expect(component.toJSON()).toMatchSnapshot();
});
