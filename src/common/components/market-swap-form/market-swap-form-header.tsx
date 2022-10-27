import { MarketSwapFormStep } from "./form-step";
import { Button } from "react-bootstrap";
import { _t } from "../../i18n";
import React, { useEffect, useState } from "react";
import { arrowLeftSvg, syncSvg } from "../../img/svg";

interface Props {
  step: MarketSwapFormStep;
  loading: boolean;
  className: string;
  onBack: () => void;
}

export const MarketSwapFormHeader = ({ step, loading, onBack, className }: Props) => {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (step === MarketSwapFormStep.FORM) setTitle(_t("market.swap-title"));
    else if (step === MarketSwapFormStep.SIGN) setTitle(_t("market.sign-title"));
    else if (step === MarketSwapFormStep.SUCCESS) setTitle(_t("market.success-title"));
  }, [step]);

  return (
    <div className={"market-swap-form-header d-flex align-items-center title mb-4 " + className}>
      {step === MarketSwapFormStep.SIGN ? (
        <Button variant="link" size="sm" disabled={loading} onClick={() => onBack()}>
          {arrowLeftSvg}
        </Button>
      ) : (
        <></>
      )}
      <div className="text-primary font-weight-bold">{title}</div>
      {loading ? <i className="loading-market-svg ml-2 text-primary">{syncSvg}</i> : <></>}
    </div>
  );
};
