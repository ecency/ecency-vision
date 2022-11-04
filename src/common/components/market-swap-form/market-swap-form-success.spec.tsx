import renderer from "react-test-renderer";
import React from "react";
import { MarketSwapFormSuccess, Props } from "./market-swap-form-success";
import { MarketAsset } from "./market-pair";

describe("MarkSwapFormSuccess", function () {
  it("should render hive -> hbd", function () {
    const props: Props = {
      from: "1",
      fromAsset: MarketAsset.HIVE,
      to: "1",
      toAsset: MarketAsset.HBD,
      onReset: jest.fn()
    };
    const component = renderer.create(<MarketSwapFormSuccess {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should render hbd -> hive", function () {
    const props: Props = {
      from: "1",
      fromAsset: MarketAsset.HBD,
      to: "1",
      toAsset: MarketAsset.HIVE,
      onReset: jest.fn()
    };
    const component = renderer.create(<MarketSwapFormSuccess {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
  });
});
