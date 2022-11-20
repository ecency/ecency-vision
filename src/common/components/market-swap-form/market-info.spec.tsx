import { MarketInfo, Props } from "./market-info";
import { MarketAsset } from "./market-pair";
import renderer from "react-test-renderer";
import React from "react";

it("should render market rate", function () {
  const props: Props = {
    className: "",
    marketRate: 2,
    fromAsset: MarketAsset.HBD,
    toAsset: MarketAsset.HIVE,
    usdFromMarketRate: 12
  };
  const component = renderer.create(<MarketInfo {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});
