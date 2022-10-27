import React from "react";
import { Button } from "react-bootstrap";
import { _t } from "../../i18n";
import { arrowRightSvg } from "../../img/svg";

interface Props {
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
      <Button variant="primary py-3 px-5 mt-4" onClick={() => onReset()}>
        {_t("market.start-new-one")}
      </Button>
    </div>
  );
};
