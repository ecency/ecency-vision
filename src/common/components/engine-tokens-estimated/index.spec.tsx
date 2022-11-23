import React from "react";
import { EngineTokensEstimated } from "./index";
import renderer from "react-test-renderer";
import { dynamicPropsIntance1 } from "../../helper/test-helper";

const props = {
  dynamicProps: dynamicPropsIntance1,
  tokens: []
};

const component = renderer.create(<EngineTokensEstimated {...props} />);

it("(1) Default render", () => {
  expect(component.toJSON()).toMatchSnapshot();
});
