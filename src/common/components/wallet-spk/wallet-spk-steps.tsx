import { WalletSpkDialogHeader } from "./wallet-spk-dialog-header";
import React, { useEffect, useState } from "react";

interface Props {
  children: JSX.Element;
  steps: {
    title: string;
    subtitle: string;
  }[];
  stepIndex: number;
}

export const WalletSpkSteps = ({ steps, stepIndex, children }: Props) => {
  const [step, setStep] = useState(steps[0]);
  useEffect(() => {
    setStep(steps[stepIndex]);
  }, [stepIndex]);

  return (
    <div className="transaction-form">
      <WalletSpkDialogHeader
        index={stepIndex + 1}
        titleKey={step.title}
        subTitleKey={step.subtitle}
      />
      <div className="transaction-form-body">{children}</div>
    </div>
  );
};
