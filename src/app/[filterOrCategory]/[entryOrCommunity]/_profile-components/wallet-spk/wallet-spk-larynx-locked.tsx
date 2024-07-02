import { WalletSpkSection } from "./wallet-spk-section";
import React from "react";
import { Props } from "./index";
import i18next from "i18next";

interface ComponentProps {
  larynxLockedBalance: string;
  onUnlock: () => void;
  showActions?: boolean;
}

export const WalletSpkLarynxLocked = (props: Props & ComponentProps) => {
  return (
    <WalletSpkSection
      {...props}
      isAlternative={true}
      title={i18next.t("wallet.spk.larynx-locked")}
      description={i18next.t("wallet.spk.larynx-locked-description")}
      slot={
        <div className="description menu">
          <p>{i18next.t("wallet.spk.larynx-locked-benefits.title")}</p>
          <ul>
            <li>{i18next.t("wallet.spk.larynx-locked-benefits.1")}</li>
            <li>{i18next.t("wallet.spk.larynx-locked-benefits.2")}</li>
            <li>{i18next.t("wallet.spk.larynx-locked-benefits.3")}</li>
            <li>{i18next.t("wallet.spk.larynx-locked-benefits.4")}</li>
            <li>{i18next.t("wallet.spk.larynx-locked-benefits.5")}</li>
          </ul>
        </div>
      }
      amountSlot={<>{props.larynxLockedBalance} LL</>}
      showItems={props.showActions}
      items={[
        {
          label: i18next.t("wallet.spk.unlock.button"),
          onClick: props.onUnlock
        }
      ]}
    />
  );
};
