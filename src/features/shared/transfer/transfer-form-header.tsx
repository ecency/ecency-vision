import React from "react";
import i18next from "i18next";

interface Props {
  step: number;
  title: string;
  subtitle: string;
}

export function TransferFormHeader({ subtitle, title, step }: Props) {
  return (
    <div className="transaction-form-header">
      <div className="step-no">{step}</div>
      <div className="box-titles">
        <div className="main-title">{i18next.t(`transfer.${title}`)}</div>
        <div className="sub-title">{i18next.t(`transfer.${subtitle}`)}</div>
      </div>
    </div>
  );
}
