import React from "react";
import i18next from "i18next";

interface Props {
  index: number;
  titleKey: string;
  subTitleKey: string;
}

export const WalletSpkDialogHeader = ({ index, titleKey, subTitleKey }: Props) => {
  return (
    <div className="transaction-form-header">
      <div className="step-no">{index}</div>
      <div className="box-titles">
        <div className="main-title">{i18next.t(titleKey)}</div>
        <div className="sub-title">{i18next.t(subTitleKey)}</div>
      </div>
    </div>
  );
};
