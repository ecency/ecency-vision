import { MarketSwapFormStep } from "./form-step";
import React, { useEffect, useState } from "react";
import { Button } from "@ui/button";
import { Spinner } from "@ui/spinner";
import i18next from "i18next";
import { arrowLeftSvg } from "@ui/svg";

export interface Props {
  step: MarketSwapFormStep;
  loading: boolean;
  className: string;
  onBack: () => void;
}

export const MarketSwapFormHeader = ({ step, loading, onBack, className }: Props) => {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (step === MarketSwapFormStep.FORM) setTitle(i18next.t("market.swap-title"));
    else if (step === MarketSwapFormStep.SIGN) setTitle(i18next.t("market.sign-title"));
    else if (step === MarketSwapFormStep.SUCCESS) setTitle(i18next.t("market.success-title"));
  }, [step]);

  return (
    <div className={"market-swap-form-header flex items-center title mb-4 " + className}>
      {step === MarketSwapFormStep.SIGN ? (
        <Button
          appearance="link"
          size="sm"
          disabled={loading}
          onClick={() => onBack()}
          icon={arrowLeftSvg}
        />
      ) : (
        <></>
      )}
      <div className="text-blue-dark-sky font-bold">{title}</div>
      {loading ? <Spinner className="w-4 h-4 ml-3" /> : <></>}
    </div>
  );
};
