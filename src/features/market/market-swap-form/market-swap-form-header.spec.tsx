import React from "react";
import renderer from "react-test-renderer";
import { MarketSwapFormHeader, Props } from "./market-swap-form-header";
import { MarketSwapFormStep } from "./form-step";

it("should render swap title", function () {
  const props: Props = {
    step: MarketSwapFormStep.FORM,
    loading: false,
    className: "",
    onBack: jest.fn()
  };
  const component = renderer.create(<MarketSwapFormHeader {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("should render sign title", function () {
  const props: Props = {
    step: MarketSwapFormStep.SIGN,
    loading: false,
    className: "",
    onBack: jest.fn()
  };
  const component = renderer.create(<MarketSwapFormHeader {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("should render success title", function () {
  const props: Props = {
    step: MarketSwapFormStep.SUCCESS,
    loading: false,
    className: "",
    onBack: jest.fn()
  };
  const component = renderer.create(<MarketSwapFormHeader {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("should render loader on loading", function () {
  const props: Props = {
    step: MarketSwapFormStep.FORM,
    loading: true,
    className: "",
    onBack: jest.fn()
  };
  const component = renderer.create(<MarketSwapFormHeader {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});
