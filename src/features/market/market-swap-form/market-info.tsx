import React from "react";
import { MarketAsset } from "./market-pair";
import { useCurrencyRateQuery } from "./api/currency-rate-query";
import { useGlobalStore } from "@/core/global-store";
import i18next from "i18next";

export interface Props {
  className: string;
  marketRate: number;
  fromAsset: MarketAsset;
  toAsset: MarketAsset;
  usdFromMarketRate: number;
}

export const MarketInfo = ({
  className,
  toAsset,
  fromAsset,
  marketRate,
  usdFromMarketRate
}: Props) => {
  const currency = useGlobalStore((s) => s.currency);
  const { isFetching, isError } = useCurrencyRateQuery(fromAsset, toAsset);

  return (
    <div>
      <small className={"market-info font-bold block mb-4 " + className}>
        1 {fromAsset} = {marketRate.toFixed(3)} {toAsset}
        {isError ? (
          <></>
        ) : (
          <span className="text-gray-600 ml-1">
            ({isFetching ? i18next.t("market.calculating-in") : usdFromMarketRate}
            <span className="pl-1" />
            {currency.toUpperCase()})
          </span>
        )}
      </small>

      <div className="rounded-xl border border-[--border-color]">
        <div className="px-4 py-3">
          <div className="flex justify-between">
            <span>{i18next.t("market.fee")}</span>
            <span className="px-2 py-1 bg-green text-xs font-bold rounded text-white">
              {i18next.t("market.fee-free")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
