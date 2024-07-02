import React, { useEffect, useState } from "react";
import { getMetrics } from "@/api/hive-engine";
import i18next from "i18next";
import { getDynamicPropsQuery } from "@/api/queries";

export const EngineTokensEstimated = (props: any) => {
  const { tokens: userTokens } = props;

  const { data: dynamicProps } = getDynamicPropsQuery().useClientQuery();
  const [estimated, setEstimated] = useState(`${i18next.t("wallet.calculating")}...`);

  useEffect(() => {
    getEstimatedUsdValue();
  }, [userTokens]);

  const getEstimatedUsdValue = async () => {
    const AllMarketTokens = await getMetrics();

    const pricePerHive = dynamicProps!.base / dynamicProps!.quote;

    let mappedBalanceMetrics = userTokens.map((item: any) => {
      let eachMetric = AllMarketTokens.find((m: any) => m.symbol === item.symbol);
      return {
        ...item,
        ...eachMetric
      };
    });

    //  const walletTokens = mappedBalanceMetrics.filter((w: any) => w.balance !== 0 || w.stakedBalance !== 0)

    const tokens_usd_prices = mappedBalanceMetrics.map((w: any) => {
      return w.symbol === "SWAP.HIVE"
        ? Number(pricePerHive * w.balance)
        : w.lastPrice === 0
          ? 0
          : Number((w.lastPrice ?? 0) * pricePerHive * w.balance);
    });

    const totalWalletUsdValue = tokens_usd_prices.reduce(
      (x: any, y: any) => +(x + y).toFixed(3),
      0
    );
    const usd_total_value = totalWalletUsdValue.toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });
    setEstimated(usd_total_value);
  };
  return (
    <div className="balance-row estimated alternative">
      <div className="balance-info">
        <div className="title">{i18next.t("wallet-engine-estimated.title")}</div>
        <div className="description">{i18next.t("wallet-engine-estimated.description")}</div>
      </div>
      <div className="balance-values">
        <div className="amount amount-bold">
          <span> {estimated} </span>
        </div>
      </div>
    </div>
  );
};
