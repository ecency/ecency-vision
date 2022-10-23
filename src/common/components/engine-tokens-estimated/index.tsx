import React, { useState, useEffect } from 'react'
import { _t } from "../../i18n";
import { getMetrics } from "../../api/hive-engine";
import { Button } from 'react-bootstrap';

export const EngineTokensEstimated = () => {

    useEffect(() => {
        // Testing metrics data
        getMetrics();
    });

    

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
}
