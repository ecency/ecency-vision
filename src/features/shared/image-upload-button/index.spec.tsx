import React from "react";

import renderer from "react-test-renderer";

import UploadButton from "./index";

import { activeUserMaker } from "../../helper/test-helper";

it("(1) Default render", () => {
  const props = {
    activeUser: activeUserMaker("foo"),
    onBegin: () => {},
    onEnd: () => {}
  };

  const component = renderer.create(<UploadButton {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});
