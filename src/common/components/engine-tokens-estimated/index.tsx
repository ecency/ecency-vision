import React, { useState, useEffect } from 'react'
import { _t } from "../../i18n";
import { getMetrics, getHiveEngineTokenBalances } from "../../api/hive-engine";

export const EngineTokensEstimated = (props: any) => {

  const { account } = props;

    useEffect(() => {
        // Testing metrics data
        getTokenData();
      });

    const getTokenData = async () => {  
     const AllMarketTokens = await getMetrics();
     const userTokens: any = await getHiveEngineTokenBalances(account.name);

      let mappedBalanceMetrics = userTokens.map((item: { symbol: any; }) => {
        let eachMetric = AllMarketTokens.find((m: { symbol: any; }) => m.symbol === item.symbol)
        return {
        ...item,
        ...eachMetric
         };
    });
 console.log(mappedBalanceMetrics) 
    };

  return (
    <div className="balance-row estimated alternative" >
    <div className="balance-info">
      <div className="title">{_t("wallet-engine-estimated.title")}</div>
      <div className="description">{_t("wallet-engine-estimated.description")}</div>
    </div>
    <div className="balance-values">
      <div className="amount amount-bold">
       $0
      </div>
    </div>
  </div>
  )
};
