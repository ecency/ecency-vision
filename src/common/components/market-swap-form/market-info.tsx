import React from "react";
import { _t } from "../../i18n";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import { MarketAsset } from "./market-pair";

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
  return (
    <div>
      <small className={"market-info font-weight-bold d-block mb-4 " + className}>
        1 {fromAsset} = {marketRate.toFixed(3)} {toAsset}
        <span className="text-secondary ml-1">(${usdFromMarketRate.toFixed(3)})</span>
      </small>

      <ListGroup>
        <ListGroupItem>
          <div className="d-flex justify-content-between">
            <span>{_t("market.fee")}</span>
            <span className="px-2 py-1 bg-green text-xs font-bold rounded text-white">
              {_t("market.fee-free")}
            </span>
          </div>
        </ListGroupItem>
      </ListGroup>
    </div>
  );
};
