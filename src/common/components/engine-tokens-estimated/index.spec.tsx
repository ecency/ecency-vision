import React from "react";
import { EngineTokensEstimated } from "./index";
import renderer from "react-test-renderer";
import { dynamicPropsIntance1, flushPromises } from "../../helper/test-helper";

it("(1) Default render", async () => {
  const props = {
    dynamicProps: dynamicPropsIntance1,
    tokens: []
  };
  const component = renderer.create(<EngineTokensEstimated {...props} />);
  await flushPromises();
  expect(component.toJSON()).toMatchSnapshot();
});
