import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import React, { useContext, useEffect, useState } from "react";
import { GenericDeckColumn } from "./generic-deck-column";
import { _t } from "../../../i18n";
import { History } from "history";
import { UserDeckGridItem } from "../types";
import "./_deck-wallet-balance-column.scss";
import { getCurrencyTokenRate, getPoints } from "../../../api/private-api";
import FormattedCurrency from "../../formatted-currency";
import { useMappedStore } from "../../../store/use-mapped-store";
import { getAccount, getConversionRequests } from "../../../api/hive";
import parseAsset from "../../../helper/parse-asset";
import HiveWallet from "../../../helper/hive-wallet";
import { FullAccount } from "../../../store/accounts/types";
import formattedNumber from "../../../util/formatted-number";
import { vestsToHp } from "../../../helper/vesting";
import { getHiveEngineTokenBalances, getMetrics } from "../../../api/hive-engine";
import { getSpkWallet } from "../../../api/spk-api";
import { getEstimatedBalance } from "../../wallet-spk/util";
import { DeckGridContext } from "../deck-manager";
import { Spinner } from "@ui/spinner";

interface Props {
  id: string;
  settings: UserDeckGridItem["settings"];
  draggable?: DraggableProvidedDragHandleProps;
  history: History;
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
  history,
  settings: { username, updateIntervalMs }
}: Props) => {
  const { global, dynamicProps } = useMappedStore();
  const { updateColumnIntervalMs } = useContext(DeckGridContext);

  const [tab, setTab] = useState<Tab>("ecency");
  const [account, setAccount] = useState<FullAccount | null>(null);

  // Ecency wallet
  const [points, setPoints] = useState("0");
  const [pointsLoading, setPointsLoading] = useState(false);
  const [estimatedValue, setEstimatedValue] = useState(0);

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

  useEffect(() => {
    fetchAccount();
  }, []);

  useEffect(() => {
    fetch();
  }, [tab]);

  const fetch = () => {
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
  };

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
      const { points } = await getPoints(username);
      const estimatedValue = await getCurrencyTokenRate("usd", "estm");

      setPoints(points);
      setEstimatedValue(estimatedValue);
    } catch (e) {
    } finally {
      setPointsLoading(false);
    }
  };

  const fetchHive = async () => {
    setHiveLoading(true);

    try {
      const crd = await getConversionRequests(username);

      let converting = 0;
      crd.forEach((x) => {
        converting += parseAsset(x.amount).amount;
      });

      if (account) {
        const wallet = new HiveWallet(account, dynamicProps, converting);
        setHive(formattedNumber(wallet.balance, { suffix: "HIVE" }));
        setHp(
          formattedNumber(vestsToHp(wallet.vestingShares, dynamicProps.hivePerMVests), {
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
  };

  const fetchEngine = async () => {
    setEngineLoading(true);

    try {
      const tokens = await getMetrics();
      const userTokens = await getHiveEngineTokenBalances(username);

      const pricePerHive = dynamicProps.base / dynamicProps.quote;

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
  };

  const fetchSpk = async () => {
    setSpkLoading(true);

    try {
      const response = await getSpkWallet(username);
      setSpk(formattedNumber(response.spk / 1000, { suffix: "SPK" }));
      setLarynx(formattedNumber(response.balance / 1000, { suffix: "LARYNX" }));
      setLarynxPower(formattedNumber(response.poweredUp / 1000, { suffix: "LARYNX" }));
      setLarynxLocked(formattedNumber(response.gov / 1000, { suffix: "LARYNX" }));
      setLarynxEstimatedValue(+(await getEstimatedBalance(response)));
    } catch (e) {
    } finally {
      setSpkLoading(false);
    }
  };

  return (
    <GenericDeckColumn
      id={id}
      draggable={draggable}
      header={{
        title: `@${username}`,
        subtitle: _t("decks.columns.balance"),
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
                description={_t("points.main-description")}
                value={`${points} POINTS`}
                isLoading={pointsLoading}
              />
              <Card
                title={_t("wallet.estimated-points")}
                description={_t("wallet.estimated-description-points")}
                value={
                  <FormattedCurrency
                    global={global}
                    value={estimatedValue * parseFloat(points)}
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
                title={_t("wallet.hive")}
                description={_t("wallet.hive-description")}
                value={hive}
                isLoading={hiveLoading}
              />
              <Card
                title={_t("wallet.hive-power")}
                description={_t("wallet.hive-power-description")}
                value={hp}
                isLoading={hiveLoading}
              />
              <Card
                title={_t("wallet.hive-dollars")}
                description={_t("wallet.hive-dollars-description")}
                value={hbd}
                isLoading={hiveLoading}
              />
              <Card
                title={_t("wallet.savings")}
                description={_t("wallet.savings-description")}
                value={savings}
                isLoading={hiveLoading}
              />
              <Card
                title={_t("wallet.estimated")}
                description={_t("wallet.estimated-description")}
                value={<FormattedCurrency global={global} value={hiveEstimatedValue} fixAt={3} />}
                isLoading={hiveLoading}
              />
            </>
          )}
          {tab === "engine" && (
            <>
              <Card
                title={_t("wallet-engine-estimated.title")}
                description={_t("wallet-engine-estimated.description")}
                value={engineEstimatedValue}
                isLoading={engineLoading}
              />
            </>
          )}
          {tab === "spk" && (
            <>
              <Card
                title={_t("wallet.spk.token")}
                description={_t("wallet.spk.token-description")}
                value={spk}
                isLoading={spkLoading}
              />
              <Card
                title={_t("wallet.spk.larynx-token")}
                description={_t("wallet.spk.larynx-token-description")}
                value={larynx}
                isLoading={spkLoading}
              />
              <Card
                title={_t("wallet.spk.larynx-power")}
                description={_t("wallet.spk.larynx-power-description")}
                value={larynxPower}
                isLoading={spkLoading}
              />
              <Card
                title={_t("wallet.spk.larynx-locked")}
                description={_t("wallet.spk.larynx-locked-description")}
                value={larynxLocked}
                isLoading={spkLoading}
              />
              <Card
                title={_t("wallet.spk.account-value")}
                description={_t("wallet.spk.account-value-description")}
                value={<FormattedCurrency global={global} value={larynxEstimatedValue} fixAt={3} />}
                isLoading={spkLoading}
              />
            </>
          )}
        </div>
      </div>
    </GenericDeckColumn>
  );
};
