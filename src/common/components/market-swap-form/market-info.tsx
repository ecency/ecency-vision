import React from "react";
import { _t } from "../../i18n";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import { MarketAsset } from "./market-pair";
import { useMappedStore } from "../../store/use-mapped-store";
import { useCurrencyRateQuery } from "./api/currency-rate-query";

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
  const { global } = useMappedStore();
  const { isFetching, isError } = useCurrencyRateQuery(fromAsset, toAsset);

  return (
    <div>
      <small className={"market-info font-weight-bold d-block mb-4 " + className}>
        1 {fromAsset} = {marketRate.toFixed(3)} {toAsset}
        {isError ? (
          <></>
        ) : (
          <span className="text-secondary ml-1">
            ({isFetching ? _t("market.calculating-in") : usdFromMarketRate}
            <span className="pl-1" />
            {global.currency.toUpperCase()})
          </span>
        )}
      </small>

      <ListGroup>
        <ListGroupItem>
          <div className="d-flex justify-content-between">
            <span>{_t("market.fee")}</span>
            <span className="badge badge-success text-white">{_t("market.fee-free")}</span>
          </div>
        </ListGroupItem>
      </ListGroup>
    </div>
  );
};
