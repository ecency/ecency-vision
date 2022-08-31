import React from "react";

import ReactTextareaAutocomplete from "./index";
import renderer from "react-test-renderer";

import { globalInstance } from "../../helper/test-helper";

const props = {
  global: globalInstance,
  id: "the-editor",
  className: "the-editor accepts-emoji form-control",
  as: "textarea",
  placeholder: "placeholder",
  value: "",
  onChange: () => {},
  rows: 10,
  spellCheck: true
};

const component = renderer.create(<ReactTextareaAutocomplete {...props} />);

it("(1) Default render", () => {
  expect(component.toJSON()).toMatchSnapshot();
});
