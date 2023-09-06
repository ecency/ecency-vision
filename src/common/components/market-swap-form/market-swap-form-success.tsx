import React from "react";
import { _t } from "../../i18n";
import { arrowRightSvg } from "../../img/svg";
import { Button } from "@ui/button";

export interface Props {
  from: string;
  fromAsset: string;
  to: string;
  toAsset: string;
  onReset: () => void;
}

export const MarketSwapFormSuccess = ({ from, to, fromAsset, toAsset, onReset }: Props) => {
  return (
    <div className="market-swap-form-success">
      <div className="title text-primary">{_t("market.success-swap")}</div>
      <div className="amount d-flex flex-column align-items-center text-center my-4">
        <span>
          {from} {fromAsset}
        </span>
        <i className="my-3">{arrowRightSvg}</i>
        <span>
          {Number(to).toFixed(3)} {toAsset}
        </span>
      </div>
      <Button appearance="link" onClick={() => onReset()}>
        {_t("market.start-new-one")}
      </Button>
    </div>
  );
};
