import React from "react";
import { WalletSpkActivePowerDown } from "./wallet-spk-active-power-down";
import { WalletSpkSection } from "./wallet-spk-section";
import { Props } from "./index";
import i18next from "i18next";
import { formattedNumber } from "@/utils";
import { Tooltip } from "@ui/tooltip";

interface ComponentProps {
  headBlock: number;
  powerDownList: string[];
  onStop: () => void;
  larynxPowerRate: string;
  larynxPowerBalance: string;
  larynxGrantedPower: string;
  larynxGrantingPower: string;
  isActiveUserWallet: boolean;
  onDelegate: () => void;
  onPowerDown: () => void;
  onDlpClick: () => void;
  onDlipClick: () => void;
  rateLPow: string;
  rateLDel: string;
}

export const WalletSpkLarynxPower = (props: Props & ComponentProps) => {
  const getTotalLarynxPower = () => {
    let balance = +props.larynxPowerBalance;

    if (+props.larynxGrantingPower > 0) {
      balance += +props.larynxGrantingPower;
    }

    if (+props.larynxGrantedPower > 0) {
      balance += +props.larynxGrantedPower;
    }

    return balance < 0 ? props.larynxPowerBalance : balance;
  };

  return (
    <WalletSpkSection
      {...props}
      title={i18next.t("wallet.spk.larynx-power")}
      description={i18next.t("wallet.spk.larynx-power-description")}
      slot={
        <>
          <div className="description menu">
            <p>{i18next.t("wallet.spk.larynx-power-benefits.title")}</p>
            <ul>
              <li>{i18next.t("wallet.spk.larynx-power-benefits.1")}</li>
              <li>{i18next.t("wallet.spk.larynx-power-benefits.2")}</li>
              <li>{i18next.t("wallet.spk.larynx-power-benefits.3")}</li>
              <li>{i18next.t("wallet.spk.larynx-power-benefits.4", { rate: props.rateLPow })}</li>
              <li>{i18next.t("wallet.spk.larynx-power-benefits.5", { rate: props.rateLDel })}</li>
            </ul>
          </div>
          {props.isActiveUserWallet ? (
            <WalletSpkActivePowerDown
              headBlock={props.headBlock}
              powerUpList={props.powerDownList}
              onStop={props.onStop}
            />
          ) : (
            <></>
          )}
        </>
      }
      amountSlot={<div className="amount">{props.larynxPowerBalance} LP</div>}
      additionalAmountSlot={
        <>
          {props.larynxGrantedPower && (
            <div className="amount amount-passive delegated-larynx">
              <Tooltip content={i18next.t("wallet.reserved-amount")}>
                <span className="amount-btn" onClick={props.onDlpClick}>
                  {"+"} {formattedNumber(props.larynxGrantedPower, { suffix: "LP" })}
                </span>
              </Tooltip>
            </div>
          )}
          {props.larynxGrantingPower && (
            <div className="amount amount-passive delegating-larynx">
              <Tooltip content={i18next.t("wallet.reserved-amount")}>
                <span className="amount-btn" onClick={props.onDlipClick}>
                  {"-"} {formattedNumber(props.larynxGrantingPower, { suffix: "LP" })}
                </span>
              </Tooltip>
            </div>
          )}
          {(props.larynxGrantedPower || props.larynxGrantingPower) && (
            <div className="amount">
              = {formattedNumber(getTotalLarynxPower(), { suffix: "LP" })}
            </div>
          )}
        </>
      }
      showItems={props.isActiveUserWallet}
      items={[
        {
          label: i18next.t("wallet.delegate"),
          onClick: props.onDelegate
        },
        {
          label: i18next.t("wallet.power-down"),
          onClick: props.onPowerDown
        }
      ]}
    />
  );
};
