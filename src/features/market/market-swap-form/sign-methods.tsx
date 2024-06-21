import {
  MarketSwappingMethods,
  swapByHs,
  swapByKc,
  swapByKey,
  SwappingMethod
} from "./api/swapping";
import React, { useState } from "react";
import { MarketAsset } from "./market-pair";
import { SignByKey } from "./sign-by-key";
import { PrivateKey } from "@hiveio/dhive";
import { HiveMarket } from "./api/hive";
import { Button } from "@ui/button";
import { useGlobalStore } from "@/core/global-store";
import { getAccountFull } from "@/api/hive";
import { error } from "@/features/shared";
import { formatError } from "@/api/operations";
import i18next from "i18next";
import { hsLogoSvg, kcLogoSvg } from "@ui/svg";

export interface Props {
  disabled: boolean;
  fromAmount: string;
  toAmount: string;
  marketRate: number;
  asset: MarketAsset;
  loading: boolean;
  setLoading: (value: boolean) => void;
  onSuccess: () => void;
}

export const SignMethods = ({
  disabled,
  fromAmount,
  toAmount,
  asset,
  loading,
  setLoading,
  onSuccess
}: Props) => {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const updateActiveUser = useGlobalStore((s) => s.updateActiveUser);
  const hasKeyChain = useGlobalStore((s) => s.hasKeyChain);

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
      await updateActiveUser(account);
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
              {i18next.t("market.swap-by", { method: "key" })}
            </Button>
          ) : (
            <></>
          )}
          {MarketSwappingMethods[asset].includes(SwappingMethod.HS) ? (
            <Button disabled={disabled} className="w-full mt-4 hs-button" onClick={onSwapByHs}>
              <i className="sign-logo mr-3">{hsLogoSvg}</i>
              {i18next.t("market.swap-by", { method: "Hivesigner" })}
            </Button>
          ) : (
            <></>
          )}
          {hasKeyChain && MarketSwappingMethods[asset].includes(SwappingMethod.KC) ? (
            <Button disabled={disabled} className="w-full mt-4 kc-button" onClick={onSwapByKc}>
              <i className="sign-logo mr-3">{kcLogoSvg}</i>
              {isSignByHsLoading
                ? i18next.t("market.signing")
                : i18next.t("market.swap-by", { method: "Keychain" })}
            </Button>
          ) : (
            <></>
          )}
        </>
      )}
    </div>
  );
};
