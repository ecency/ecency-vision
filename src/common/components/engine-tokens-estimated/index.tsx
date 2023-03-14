import React, { useState, useEffect } from "react";
import { _t } from "../../i18n";
import { getMetrics } from "../../api/hive-engine";

export const EngineTokensEstimated = (props: any) => {
  const { tokens: userTokens, dynamicProps } = props;
  const [estimated, setEstimated] = useState(`${_t("wallet.calculating")}...`);

  useEffect(() => {
    getEstimatedUsdValue();
  }, [userTokens]);

  const getEstimatedUsdValue = async () => {
    const AllMarketTokens = await getMetrics();

    const pricePerHive = dynamicProps.base / dynamicProps.quote;

    let mappedBalanceMetrics = userTokens.map((item: any) => {
      let eachMetric = AllMarketTokens.find((m: any) => m.symbol === item.symbol);
      return {
        ...item,
        ...eachMetric
      };
    });

    const tokens_usd_prices = mappedBalanceMetrics.map((w: any) => {
      return w.symbol === "SWAP.HIVE"
        ? Number(pricePerHive * w.balance)
        : w.lastPrice === 0
        ? 0
        : Number(w.lastPrice * pricePerHive * w.balance);
    });

    const totalWalletUsdValue = tokens_usd_prices.reduce((x: any, y: any) => {
      const totalValue = +(x + y).toFixed(3);
      return totalValue;
    }, 0);
    const usd_total_value = totalWalletUsdValue.toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });
    setEstimated(usd_total_value);
  };
  return (
    <div className="balance-row estimated alternative">
      <div className="balance-info">
        <div className="title">{_t("wallet-engine-estimated.title")}</div>
        <div className="description">{_t("wallet-engine-estimated.description")}</div>
      </div>
      <div className="balance-values">
        <div className="amount amount-bold">
          <span> {estimated} </span>
        </div>
      </div>
    </div>
  );
};
