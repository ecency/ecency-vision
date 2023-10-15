import {
  MarketSwappingMethods,
  swapByHs,
  swapByKc,
  swapByKey,
  SwappingMethod
} from "./api/swapping";
import { _t } from "../../i18n";
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
import { HiveMarket } from "./api/hive";
import { Button } from "@ui/button";

export interface Props {
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
  onSuccess: () => void;
  signingKey: string;
  setSigningKey: (key: string) => void;
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
  global,
  onSuccess,
  signingKey,
  setSigningKey
}: Props) => {
  const [showSignByKey, setShowSignByKey] = useState(false);
  const [isSignByKeyLoading, setIsSignByKeyLoading] = useState(false);
  const [isSignByHsLoading, setIsSignByHsLoading] = useState(false);

  const onSwapByHs = () => {
    swapByHs({
      activeUser,
      fromAsset: asset,
      fromAmount,
      toAmount
    });
  };

  const onSwapByKey = async (key: PrivateKey) => {
    setIsSignByKeyLoading(true);
    try {
      await swapAction((toAmount) =>
        swapByKey(key, {
          activeUser,
          fromAsset: asset,
          fromAmount,
          toAmount
        })
      );
    } finally {
      setIsSignByKeyLoading(false);
    }
  };

  const onSwapByKc = async () => {
    setIsSignByHsLoading(true);
    try {
      await swapAction((toAmount) =>
        swapByKc({
          activeUser,
          fromAsset: asset,
          fromAmount,
          toAmount
        })
      );
    } finally {
      setIsSignByHsLoading(false);
    }
  };

  const swapAction = async (action: (toAmount: string) => Promise<any>) => {
    setLoading(true);
    try {
      const amount = await HiveMarket.getNewAmount(toAmount, fromAmount, asset);
      await action(amount);
      const account = await getAccountFull(activeUser!.username);
      addAccount(account);
      updateActiveUser(account);
      onSuccess();
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
          signingKey={signingKey}
          setSigningKey={(key) => setSigningKey(key)}
          activeUser={activeUser}
          isLoading={isSignByKeyLoading}
          onKey={(key) => onSwapByKey(key)}
          onBack={() => setShowSignByKey(false)}
        />
      ) : (
        <>
          {MarketSwappingMethods[asset].includes(SwappingMethod.KEY) ? (
            <Button
              disabled={disabled}
              outline={true}
              className="w-full mt-4"
              onClick={() => setShowSignByKey(true)}
            >
              {_t("market.swap-by", { method: "key" })}
            </Button>
          ) : (
            <></>
          )}
          {MarketSwappingMethods[asset].includes(SwappingMethod.HS) ? (
            <Button disabled={disabled} className="w-full mt-4 hs-button" onClick={onSwapByHs}>
              <i className="sign-logo mr-3">{hsLogoSvg}</i>
              {_t("market.swap-by", { method: "Hivesigner" })}
            </Button>
          ) : (
            <></>
          )}
          {global.hasKeyChain && MarketSwappingMethods[asset].includes(SwappingMethod.KC) ? (
            <Button disabled={disabled} className="w-full mt-4 kc-button" onClick={onSwapByKc}>
              <i className="sign-logo mr-3">{kcLogoSvg}</i>
              {isSignByHsLoading
                ? _t("market.signing")
                : _t("market.swap-by", { method: "Keychain" })}
            </Button>
          ) : (
            <></>
          )}
        </>
      )}
    </div>
  );
};
