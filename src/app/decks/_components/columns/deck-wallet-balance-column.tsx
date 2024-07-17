import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { GenericDeckColumn } from "./generic-deck-column";
import { UserDeckGridItem } from "../types";
import "./_deck-wallet-balance-column.scss";
import { DeckGridContext } from "../deck-manager";
import { Spinner } from "@ui/spinner";
import { getDynamicPropsQuery, getPointsQuery } from "@/api/queries";
import { FullAccount } from "@/entities";
import { getAccount, getConversionRequests } from "@/api/hive";
import { getCurrencyTokenRate } from "@/api/private-api";
import {
  formattedNumber,
  getSplEstimatedBalance,
  HiveWallet,
  parseAsset,
  vestsToHp
} from "@/utils";
import { getHiveEngineTokenBalances, getMetrics } from "@/api/hive-engine";
import { getSpkWallet } from "@/api/spk-api";
import i18next from "i18next";
import { FormattedCurrency } from "@/features/shared";
import useMount from "react-use/lib/useMount";

interface Props {
  id: string;
  settings: UserDeckGridItem["settings"];
  draggable?: DraggableProvidedDragHandleProps | null;
}

export type Tab = "ecency" | "hive" | "engine" | "spk";
const TABS: Tab[] = ["ecency", "hive", "engine", "spk"];

interface CardProps {
  title: string;
  description: string;
  value: any;
  isLoading: boolean;
}

const Card = ({ title, description, isLoading, value }: CardProps) => (
  <div className="wb-card">
    <div className="title">{title}</div>
    <div className="description">{description}</div>
    <div className={"value " + (isLoading ? "" : "loaded")}>
      {isLoading ? <Spinner className="w-4 h-4" /> : value}
    </div>
  </div>
);

export const DeckWalletBalanceColumn = ({
  id,
  draggable,
  settings: { username, updateIntervalMs }
}: Props) => {
  const { data: dynamicProps } = getDynamicPropsQuery().useClientQuery();
  const { updateColumnIntervalMs } = useContext(DeckGridContext);

  const [tab, setTab] = useState<Tab>("ecency");
  const [account, setAccount] = useState<FullAccount | null>(null);

  // Ecency wallet
  const [pointsLoading, setPointsLoading] = useState(false);
  const [estimatedValue, setEstimatedValue] = useState(0);
  const { data: points } = getPointsQuery(username).useClientQuery();

  // Hive wallet
  const [hive, setHive] = useState("0");
  const [hp, setHp] = useState("0");
  const [hbd, setHbd] = useState("0");
  const [savings, setSavings] = useState("0");
  const [hiveEstimatedValue, setHiveEstimatedValue] = useState(0);
  const [hiveLoading, setHiveLoading] = useState(false);

  // Hive engine wallet
  const [engineEstimatedValue, setEngineEstimatedValue] = useState("0");
  const [engineLoading, setEngineLoading] = useState(false);

  // SPK wallet
  const [spk, setSpk] = useState("0");
  const [larynx, setLarynx] = useState("0");
  const [larynxPower, setLarynxPower] = useState("0");
  const [larynxLocked, setLarynxLocked] = useState("0");
  const [larynxEstimatedValue, setLarynxEstimatedValue] = useState(0);
  const [spkLoading, setSpkLoading] = useState(false);

  useMount(() => {
    fetchAccount();
  });

  const fetchAccount = async () => {
    try {
      const response = await getAccount(username);
      if (response) {
        setAccount(response);
      }
    } catch (e) {
    } finally {
    }
  };

  const fetchEcencyPoints = async () => {
    setPointsLoading(true);

    try {
      const estimatedValue = await getCurrencyTokenRate("usd", "estm");

      setEstimatedValue(estimatedValue);
    } catch (e) {
    } finally {
      setPointsLoading(false);
    }
  };

  const fetchHive = useCallback(async () => {
    setHiveLoading(true);

    try {
      const crd = await getConversionRequests(username);

      let converting = 0;
      crd.forEach((x) => {
        converting += parseAsset(x.amount).amount;
      });

      if (account) {
        const wallet = new HiveWallet(account, dynamicProps!, converting);
        setHive(formattedNumber(wallet.balance, { suffix: "HIVE" }));
        setHp(
          formattedNumber(vestsToHp(wallet.vestingShares, dynamicProps!.hivePerMVests), {
            suffix: "HP"
          })
        );
        setHbd(formattedNumber(wallet.hbdBalance, { prefix: "$" }));
        setSavings(formattedNumber(wallet.savingBalance, { suffix: "HIVE" }));
        setHiveEstimatedValue(wallet.estimatedValue);
      }
    } catch (e) {
    } finally {
      setHiveLoading(false);
    }
  }, [account, dynamicProps, username]);

  const fetchEngine = useCallback(async () => {
    setEngineLoading(true);

    try {
      const tokens = await getMetrics();
      const userTokens = await getHiveEngineTokenBalances(username);

      const pricePerHive = dynamicProps!.base / dynamicProps!.quote;

      const mappedBalanceMetrics = userTokens.map((item: any) => ({
        ...item,
        ...tokens.find((m: any) => m.symbol === item.symbol)
      }));

      const tokensUsdPrices = mappedBalanceMetrics.map((w: any) => {
        return w.symbol === "SWAP.HIVE"
          ? Number(pricePerHive * w.balance)
          : w.lastPrice === 0
            ? 0
            : Number(w.lastPrice * pricePerHive * w.balance);
      });

      const totalWalletUsdValue = tokensUsdPrices.reduce(
        (x: any, y: any) => +(x + y).toFixed(3),
        0
      );
      const usdTotalValue = totalWalletUsdValue.toLocaleString("en-US", {
        style: "currency",
        currency: "USD"
      });
      setEngineEstimatedValue(usdTotalValue);
    } catch (e) {
    } finally {
      setEngineLoading(false);
    }
  }, [dynamicProps, username]);

  const fetchSpk = useCallback(async () => {
    setSpkLoading(true);

    try {
      const response = await getSpkWallet(username);
      setSpk(formattedNumber(response.spk / 1000, { suffix: "SPK" }));
      setLarynx(formattedNumber(response.balance / 1000, { suffix: "LARYNX" }));
      setLarynxPower(formattedNumber(response.poweredUp / 1000, { suffix: "LARYNX" }));
      setLarynxLocked(formattedNumber(response.gov / 1000, { suffix: "LARYNX" }));
      setLarynxEstimatedValue(+(await getSplEstimatedBalance(response)));
    } catch (e) {
    } finally {
      setSpkLoading(false);
    }
  }, [username]);

  const fetch = useCallback(() => {
    if (tab === "ecency") {
      fetchEcencyPoints();
    }
    if (tab === "hive") {
      fetchHive();
    }

    if (tab === "engine") {
      fetchEngine();
    }

    if (tab === "spk") {
      fetchSpk();
    }
  }, [fetchEngine, fetchHive, fetchSpk, tab]);

  useEffect(() => {
    fetch();
  }, [fetch, tab]);

  return (
    <GenericDeckColumn
      id={id}
      draggable={draggable}
      header={{
        title: `@${username}`,
        subtitle: i18next.t("decks.columns.balance"),
        icon: null,
        updateIntervalMs: updateIntervalMs,
        setUpdateIntervalMs: (v) => updateColumnIntervalMs(id, v)
      }}
      isReloading={false}
      onReload={() => fetch()}
    >
      <div className="wb-container">
        <div className="wb-tabs">
          {TABS.map((t) => (
            <div
              className={"wb-tab " + (tab === t ? "active" : "")}
              key={t}
              onClick={() => setTab(t)}
            >
              {t}
            </div>
          ))}
        </div>
        <div className="wb-content p-3">
          {tab === "ecency" && (
            <>
              <Card
                title="Ecency points"
                description={i18next.t("points.main-description")}
                value={`${points} POINTS`}
                isLoading={pointsLoading}
              />
              <Card
                title={i18next.t("wallet.estimated-points")}
                description={i18next.t("wallet.estimated-description-points")}
                value={
                  <FormattedCurrency
                    value={estimatedValue * parseFloat(points?.points ?? "0")}
                    fixAt={3}
                  />
                }
                isLoading={pointsLoading}
              />
            </>
          )}
          {tab === "hive" && (
            <>
              <Card
                title={i18next.t("wallet.hive")}
                description={i18next.t("wallet.hive-description")}
                value={hive}
                isLoading={hiveLoading}
              />
              <Card
                title={i18next.t("wallet.hive-power")}
                description={i18next.t("wallet.hive-power-description")}
                value={hp}
                isLoading={hiveLoading}
              />
              <Card
                title={i18next.t("wallet.hive-dollars")}
                description={i18next.t("wallet.hive-dollars-description")}
                value={hbd}
                isLoading={hiveLoading}
              />
              <Card
                title={i18next.t("wallet.savings")}
                description={i18next.t("wallet.savings-description")}
                value={savings}
                isLoading={hiveLoading}
              />
              <Card
                title={i18next.t("wallet.estimated")}
                description={i18next.t("wallet.estimated-description")}
                value={<FormattedCurrency value={hiveEstimatedValue} fixAt={3} />}
                isLoading={hiveLoading}
              />
            </>
          )}
          {tab === "engine" && (
            <>
              <Card
                title={i18next.t("wallet-engine-estimated.title")}
                description={i18next.t("wallet-engine-estimated.description")}
                value={engineEstimatedValue}
                isLoading={engineLoading}
              />
            </>
          )}
          {tab === "spk" && (
            <>
              <Card
                title={i18next.t("wallet.spk.token")}
                description={i18next.t("wallet.spk.token-description")}
                value={spk}
                isLoading={spkLoading}
              />
              <Card
                title={i18next.t("wallet.spk.larynx-token")}
                description={i18next.t("wallet.spk.larynx-token-description")}
                value={larynx}
                isLoading={spkLoading}
              />
              <Card
                title={i18next.t("wallet.spk.larynx-power")}
                description={i18next.t("wallet.spk.larynx-power-description")}
                value={larynxPower}
                isLoading={spkLoading}
              />
              <Card
                title={i18next.t("wallet.spk.larynx-locked")}
                description={i18next.t("wallet.spk.larynx-locked-description")}
                value={larynxLocked}
                isLoading={spkLoading}
              />
              <Card
                title={i18next.t("wallet.spk.account-value")}
                description={i18next.t("wallet.spk.account-value-description")}
                value={<FormattedCurrency value={larynxEstimatedValue} fixAt={3} />}
                isLoading={spkLoading}
              />
            </>
          )}
        </div>
      </div>
    </GenericDeckColumn>
  );
};
