"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { WalletSpkSection } from "./wallet-spk-section";
import { SendSpkDialog } from "./send-spk-dialog";
import { WalletSpkLarynxPower } from "./wallet-spk-larynx-power";
import { WalletSpkLarynxLocked } from "./wallet-spk-larynx-locked";
import { WalletSpkUnclaimedPoints } from "./wallet-spk-unclaimed-points";
import { WalletSpkDelegatedPowerDialog } from "./wallet-spk-delegated-power-dialog";
import { getEstimatedBalance } from "./util";
import { Account, Market } from "@/entities";
import i18next from "i18next";
import { WalletMenu } from "../wallet-menu";
import { claimLarynxRewards, getMarkets, getSpkWallet, rewardSpk } from "@/api/spk-api";
import { useGlobalStore } from "@/core/global-store";
import { error, success } from "@/features/shared";
import { formatError } from "@/api/operations";
import { usePrevious } from "react-use";

export interface Props {
  account: Account;
}

export function WalletSpk({ account }: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const previousActiveUser = usePrevious(activeUser);

  const [tokenBalance, setTokenBalance] = useState("0");
  const [larynxAirBalance, setLarynxAirBalance] = useState("0");
  const [larynxPowerBalance, setLarynxPowerBalance] = useState("0");
  const [larynxTokenBalance, setLarynxTokenBalance] = useState("0");
  const [activeUserTokenBalance, setActiveUserTokenBalance] = useState("0");
  const [activeUserLarynxTokenBalance, setActiveUserLarynxTokenBalance] = useState("0");
  const [estimatedBalance, setEstimatedBalance] = useState("0");
  const [larynxPowerRate, setLarynxPowerRate] = useState("0");
  const [larynxGrantedPower, setLarynxGrantedPower] = useState("");
  const [larynxGrantingPower, setLarynxGrantingPower] = useState("");
  const [larynxLockedBalance, setLarynxLockedBalance] = useState("");
  const [sendSpkShow, setSendSpkShow] = useState(false);
  const [delegatedPowerDialogShow, setDelegatedPowerDialogShow] = useState(false);
  const [delegatingPowerDialogShow, setDelegatingPowerDialogShow] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<"SPK" | "LARYNX" | "LP">("SPK");
  const [selectedType, setSelectedType] = useState<
    "transfer" | "delegate" | "powerup" | "powerdown" | "lock" | "unlock"
  >("transfer");
  const [claim, setClaim] = useState("0");
  const [claiming, setClaiming] = useState(false);
  const [headBlock, setHeadBlock] = useState(0);
  const [powerDownList, setPowerDownList] = useState<string[]>([]);
  const [prefilledAmount, setPrefilledAmount] = useState("");
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isNode, setIsNode] = useState(false);
  const [delegatedItems, setDelegatedItems] = useState<[string, number][]>([]);
  const [delegatingItems, setDelegatingItems] = useState<[string, number][]>([]);
  const [rateLPow, setRateLPow] = useState("0.0001");
  const [rateLDel, setRateLDel] = useState("0.00015");

  const isActiveUserWallet = useMemo(
    () => activeUser?.username === account.name,
    [account.name, activeUser?.username]
  );

  let balance = "0";

  switch (selectedAsset) {
    case "SPK":
      balance = +isActiveUserWallet ? tokenBalance : activeUserTokenBalance;
      break;
    case "LARYNX":
      if (["transfer", "powerup", "lock"].includes(selectedType)) {
        balance = +isActiveUserWallet ? larynxTokenBalance : activeUserLarynxTokenBalance;
      } else if (selectedType === "delegate") {
        balance = larynxPowerBalance;
      } else if (selectedType === "unlock") {
        balance = larynxLockedBalance;
      }
      break;
    case "LP":
      if (selectedType === "powerdown" || selectedType === "delegate") {
        balance = larynxPowerBalance;
      }
  }

  const fetchActiveUserWallet = useCallback(async () => {
    const format = (value: number) => value.toFixed(3);
    if (!isActiveUserWallet && activeUser) {
      const activeUserWallet = await getSpkWallet(activeUser?.username);
      setActiveUserTokenBalance(format(activeUserWallet.spk / 1000));
      setActiveUserLarynxTokenBalance(format(activeUserWallet.balance / 1000));
    }
  }, [activeUser, isActiveUserWallet]);
  const fetch = async () => {
    try {
      const wallet = await getSpkWallet(account.name);
      const format = (value: number) => value.toFixed(3);

      setTokenBalance(format(wallet.spk / 1000));
      setLarynxAirBalance(format(wallet.drop.availible.amount / 1000));
      setLarynxTokenBalance(format(wallet.balance / 1000));
      setLarynxPowerBalance(format(wallet.poweredUp / 1000));
      setLarynxGrantedPower(wallet.granted?.t ? format(wallet.granted.t / 1000) : "");
      setLarynxGrantingPower(wallet.granting?.t ? format(wallet.granting.t / 1000) : "");
      setLarynxLockedBalance(wallet.gov > 0 ? format(wallet.gov / 1000) : "");
      setClaim(format(wallet.claim / 1000));
      setLarynxPowerRate("0.010");
      setHeadBlock(wallet.head_block);
      setPowerDownList(Object.values(wallet.power_downs));
      setDelegatedItems(
        Object.entries(wallet.granted).filter(([name]) => name !== "t") as [string, number][]
      );
      setDelegatingItems(
        Object.entries(wallet.granting).filter(([name]) => name !== "t") as [string, number][]
      );

      fetchActiveUserWallet();
      setEstimatedBalance(await getEstimatedBalance(wallet));

      const { raw, list } = await getMarkets();
      setMarkets(list);
      setIsNode(list.some((market) => market.name === account?.name));
      setRateLPow(format(parseFloat(raw.stats.spk_rate_lpow) * 100));
      setRateLDel(format(parseFloat(raw.stats.spk_rate_ldel) * 100));
      setTokenBalance(
        format(
          (wallet.spk +
            rewardSpk(
              wallet,
              raw.stats || {
                spk_rate_lgov: "0.001",
                spk_rate_lpow: rateLPow,
                spk_rate_ldel: rateLDel
              }
            )) /
            1000
        )
      );
    } catch (e) {
      console.error(e);
    }
  };
  const claimRewards = () => {
    if (claiming || !activeUser) {
      return;
    }

    setClaiming(true);

    return claimLarynxRewards(activeUser.username)
      .then((account) => {
        success(i18next.t("wallet.claim-reward-balance-ok"));
      })
      .then(() => {
        setClaim("0");
      })
      .catch((err) => {
        console.log(err);
        error(...formatError(err));
      })
      .finally(() => {
        setClaiming(false);
      });
  };

  useEffect(() => {
    if (activeUser && activeUser?.username !== previousActiveUser?.username) {
      fetchActiveUserWallet();
    }
  }, [activeUser, fetchActiveUserWallet, previousActiveUser?.username]);

  return (
    <div className="wallet-ecency wallet-spk">
      <div className="wallet-main">
        <div className="wallet-info">
          {+claim > 0 ? (
            <WalletSpkUnclaimedPoints
              claim={claim}
              claiming={false}
              asset={"LARYNX"}
              isActiveUserWallet={isActiveUserWallet}
              onClaim={() => claimRewards()}
            />
          ) : (
            <></>
          )}
          <WalletSpkSection
            account={account}
            title={i18next.t("wallet.spk.token")}
            description={i18next.t("wallet.spk.token-description")}
            amountSlot={<>{tokenBalance} SPK</>}
            items={[
              {
                label: i18next.t("wallet.transfer"),
                onClick: () => {
                  setSendSpkShow(true);
                  setSelectedAsset("SPK");
                  setSelectedType("transfer");
                }
              }
            ]}
          />
          <WalletSpkSection
            account={account}
            isAlternative={true}
            title={i18next.t("wallet.spk.larynx-token")}
            description={i18next.t("wallet.spk.larynx-token-description")}
            amountSlot={<>{larynxTokenBalance} LARYNX</>}
            items={[
              {
                label: i18next.t("wallet.transfer"),
                onClick: () => {
                  setSendSpkShow(true);
                  setSelectedAsset("LARYNX");
                  setSelectedType("transfer");
                }
              },
              ...(isActiveUserWallet
                ? [
                    {
                      label: i18next.t("wallet.power-up"),
                      onClick: () => {
                        setSendSpkShow(true);
                        setSelectedAsset("LARYNX");
                        setSelectedType("powerup");
                      }
                    }
                  ]
                : []),
              ...(isActiveUserWallet && +larynxTokenBalance > 0
                ? [
                    {
                      label: i18next.t("wallet.spk.lock.button"),
                      onClick: () => {
                        setSendSpkShow(true);
                        setSelectedAsset("LARYNX");
                        setSelectedType("lock");
                      }
                    }
                  ]
                : [])
            ]}
          />
          <WalletSpkLarynxPower
            account={account}
            isActiveUserWallet={isActiveUserWallet}
            rateLDel={rateLDel}
            rateLPow={rateLPow}
            larynxGrantedPower={larynxGrantedPower}
            larynxGrantingPower={larynxGrantingPower}
            headBlock={headBlock}
            powerDownList={powerDownList}
            onStop={() => {
              setSendSpkShow(true);
              setSelectedAsset("LP");
              setSelectedType("powerdown");
              setPrefilledAmount("0");
            }}
            larynxPowerRate={larynxPowerRate}
            larynxPowerBalance={larynxPowerBalance}
            onDelegate={() => {
              setSendSpkShow(true);
              setSelectedAsset("LP");
              setSelectedType("delegate");
            }}
            onPowerDown={() => {
              setSendSpkShow(true);
              setSelectedAsset("LP");
              setSelectedType("powerdown");
            }}
            onDlpClick={() => setDelegatedPowerDialogShow(true)}
            onDlipClick={() => setDelegatingPowerDialogShow(true)}
          />
          {larynxLockedBalance && isNode ? (
            <WalletSpkLarynxLocked
              showActions={isActiveUserWallet && +larynxLockedBalance > 0}
              onUnlock={() => {
                setSendSpkShow(true);
                setSelectedAsset("LARYNX");
                setSelectedType("unlock");
              }}
              larynxLockedBalance={larynxLockedBalance}
              account={account}
            />
          ) : (
            <></>
          )}
          <WalletSpkSection
            isAlternative={true}
            items={[]}
            title={i18next.t("wallet.spk.account-value")}
            description={i18next.t("wallet.spk.account-value-description")}
            amountSlot={<div className="amount amount-bold">${estimatedBalance}</div>}
            account={account}
          />
        </div>
        <WalletMenu username={account.name} active="spk" />
      </div>

      <SendSpkDialog
        markets={markets}
        prefilledAmount={prefilledAmount}
        prefilledTo={isActiveUserWallet ? "" : account.name}
        type={selectedType}
        asset={selectedAsset}
        account={account}
        show={sendSpkShow}
        setShow={(v) => setSendSpkShow(v)}
        balance={balance}
        onFinish={() => fetch()}
      />

      <WalletSpkDelegatedPowerDialog
        show={delegatedPowerDialogShow}
        setShow={(value) => setDelegatedPowerDialogShow(value)}
        items={delegatedItems}
      />
      <WalletSpkDelegatedPowerDialog
        show={delegatingPowerDialogShow}
        setShow={(value) => setDelegatingPowerDialogShow(value)}
        items={delegatingItems}
      />
    </div>
  );
}
