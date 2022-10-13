import {
  MarketSwappingMethods,
  swapByHs,
  swapByKc,
  swapByKey,
  SwappingMethod
} from "./api/swapping";
import { _t } from "../../i18n";
import { Button } from "react-bootstrap";
import React, { useState } from "react";
import { MarketAsset } from "./market-pair";
import { Global } from "../../store/global/types";
import { hsLogoSvg, kcLogoSvg } from "../../img/svg";
import { formatError } from "../../api/operations";
import { ActiveUser } from "../../store/active-user/types";
import { getAccountFull } from "../../api/hive";
import { error } from "../feedback";
import { SignByKey } from "./sign-by-key";
import { PrivateKey } from "@hiveio/dhive";

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
  const [showSignByKey, setShowSignByKey] = useState(false);

  const onSwapByHs = async () => {
    swapByHs({
      activeUser,
      fromAsset: asset,
      fromAmount,
      toAmount
    });
  };

  const onSwapByKey = async (key: PrivateKey) => {
    await swapAction(
      swapByKey(key, {
        activeUser,
        fromAsset: asset,
        fromAmount,
        toAmount
      })
    );
  };

  const onSwapByKc = async () => {
    await swapAction(
      swapByKc({
        activeUser,
        fromAsset: asset,
        fromAmount,
        toAmount
      })
    );
  };

  const swapAction = async (action: Promise<any>) => {
    setLoading(true);
    try {
      await action;
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
      {showSignByKey ? (
        <SignByKey
          activeUser={activeUser}
          onKey={(key) => onSwapByKey(key)}
          onBack={() => setShowSignByKey(false)}
        />
      ) : (
        <>
          {MarketSwappingMethods[asset].includes(SwappingMethod.KEY) ? (
            <Button
              block={true}
              disabled={disabled}
              variant="outline-primary"
              className="py-3 mt-4"
              onClick={() => setShowSignByKey(true)}
            >
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
        </>
      )}
    </div>
  );
};
