import React from "react";
import { Button } from "@ui/button";
import i18next from "i18next";
import { arrowRightSvg } from "@ui/svg";

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
      <div className="title text-blue-dark-sky">{i18next.t("market.success-swap")}</div>
      <div className="amount flex flex-col items-center text-center my-4">
        <span>
          {from} {fromAsset}
        </span>
        <i className="my-3">{arrowRightSvg}</i>
        <span>
          {Number(to).toFixed(3)} {toAsset}
        </span>
      </div>
      <Button appearance="link" onClick={() => onReset()}>
        {i18next.t("market.start-new-one")}
      </Button>
    </div>
  );
};
