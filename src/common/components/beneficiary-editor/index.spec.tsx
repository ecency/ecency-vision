import React from "react";

import BeneficiaryEditorDialog, { DialogBody } from "./index";

import TestRenderer from "react-test-renderer";

const defProps = {
  body: "",
  list: [
    {
      account: "foo",
      weight: 1000
    }
  ],
  onAdd: () => {},
  onDelete: () => {}
};

it("(1) Default render", () => {
  const props = {
    ...defProps,
    list: []
  };
  const renderer = TestRenderer.create(<BeneficiaryEditorDialog {...props} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Default render with author", () => {
  const renderer = TestRenderer.create(<BeneficiaryEditorDialog {...defProps} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(3) DialogBody", () => {
  const renderer = TestRenderer.create(<DialogBody {...defProps} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(4) DialogBody with author", () => {
  const props = {
    ...defProps,
    author: "bar"
  };
  const renderer = TestRenderer.create(<DialogBody {...props} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});
