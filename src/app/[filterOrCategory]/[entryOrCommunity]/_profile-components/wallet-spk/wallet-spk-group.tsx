import React from "react";
import i18next from "i18next";

interface Props {
  label: string;
  children: JSX.Element;
}

export const WalletSpkGroup = ({ label, children }: Props) => {
  return (
    <div className="grid grid-cols-12 mb-3">
      <div className="col-span-12 sm:col-span-2">
        <label>{i18next.t(label)}</label>
      </div>
      <div className="col-span-12 sm:col-span-10">{children}</div>
    </div>
  );
};
