import { _t } from "../../i18n";
import React from "react";

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
        <div className="main-title">{_t(titleKey)}</div>
        <div className="sub-title">{_t(subTitleKey)}</div>
      </div>
    </div>
  );
};
