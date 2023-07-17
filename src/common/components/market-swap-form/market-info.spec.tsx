import { MarketInfo, Props } from "./market-info";
import { MarketAsset } from "./market-pair";
import React from "react";
import { withStore } from "../../tests/with-store";
import { queryClient } from "../../core";
import { QueryClientProvider } from "@tanstack/react-query";

it("should render market rate", function () {
  const props: Props = {
    className: "",
    marketRate: 2,
    fromAsset: MarketAsset.HBD,
    toAsset: MarketAsset.HIVE,
    usdFromMarketRate: 12
  };
  const component = withStore(
    <QueryClientProvider client={queryClient}>
      <MarketInfo {...props} />
    </QueryClientProvider>
  );
  expect(component.toJSON()).toMatchSnapshot();
});
