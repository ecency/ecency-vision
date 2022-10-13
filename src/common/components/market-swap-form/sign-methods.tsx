import { MarketSwappingMethods, swapByHs, swapByKc, SwappingMethod } from "./api/swapping";
import { _t } from "../../i18n";
import { Button } from "react-bootstrap";
import React from "react";
import { MarketAsset } from "./market-pair";
import { Global } from "../../store/global/types";
import { hsLogoSvg, kcLogoSvg } from "../../img/svg";
import { formatError } from "../../api/operations";
import { ActiveUser } from "../../store/active-user/types";
import { getAccountFull } from "../../api/hive";
import { error } from "../feedback";

interface Props {
  global: Global;
  disabled: boolean;
  fromAmount: string;
  toAmount: string;
  marketRate: number;
  asset: MarketAsset;
  loading: boolean;
  setLoading: (value: boolean) => void;
  activeUser: ActiveUser | null;
  addAccount: any;
  updateActiveUser: any;
}

export const SignMethods = ({
  disabled,
  fromAmount,
  toAmount,
  asset,
  loading,
  setLoading,
  activeUser,
  addAccount,
  updateActiveUser,
  global
}: Props) => {
  const onSwapByHs = async () => {
    setLoading(true);
    try {
      await swapByHs({
        activeUser,
        fromAsset: asset,
        fromAmount,
        toAmount
      });
      const account = await getAccountFull(activeUser!.username);
      addAccount(account);
      updateActiveUser(account);
    } catch (e) {
      error(...formatError(e));
    } finally {
      setLoading(false);
    }
  };

  const onSwapByKc = async () => {
    setLoading(true);
    try {
      await swapByKc({
        activeUser,
        fromAsset: asset,
        fromAmount,
        toAmount
      });
      const account = await getAccountFull(activeUser!.username);
      addAccount(account);
      updateActiveUser(account);
    } catch (e) {
      error(...formatError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {MarketSwappingMethods[asset].includes(SwappingMethod.KEY) ? (
        <Button block={true} disabled={disabled} variant="outline-primary" className="py-3 mt-4">
          {_t("market.swap-by", { method: "key" })}
        </Button>
      ) : (
        <></>
      )}
      {MarketSwappingMethods[asset].includes(SwappingMethod.HS) ? (
        <Button
          block={true}
          disabled={disabled}
          className="py-3 mt-4 hs-button"
          onClick={onSwapByHs}
        >
          <i className="sign-logo mr-3">{hsLogoSvg}</i>
          {_t("market.swap-by", { method: "Hivesigner" })}
        </Button>
      ) : (
        <></>
      )}
      {global.hasKeyChain && MarketSwappingMethods[asset].includes(SwappingMethod.KC) ? (
        <Button
          block={true}
          disabled={disabled}
          className="py-3 mt-4 kc-button"
          onClick={onSwapByKc}
        >
          <i className="sign-logo mr-3">{kcLogoSvg}</i>
          {_t("market.swap-by", { method: "Keychain" })}
        </Button>
      ) : (
        <></>
      )}
    </div>
  );
};
