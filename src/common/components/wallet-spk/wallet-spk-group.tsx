import { _t } from "../../i18n";
import React from "react";

interface Props {
  label: string;
  children: JSX.Element;
}

export const WalletSpkGroup = ({ label, children }: Props) => {
  return (
    <div className="grid grid-cols-12 mb-3">
      <div className="col-span-12 sm:col-span-2">
        <label>{_t(label)}</label>
      </div>
      <div className="col-span-12 sm:col-span-10">{children}</div>
    </div>
  );
};
