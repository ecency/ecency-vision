import React, { useState, useEffect } from 'react'
import DropDown, { MenuItem } from "../dropdown";
import { _t } from "../../i18n";

export const SortEngineTokens = (props: any) => {
    
  const {
    sortTokensInAscending,
    sortTokensInDescending,
    sortTokensbyStake,
    sortTokensbyBalance,
    sortByDelegationIn,
    sortByDelegationOut,
    sortByPrecision
  } = props;
    

  return (

    <div className="balance-values">
    <div className="amount">
      {(() => {
        let dropDownConfig: any;
          dropDownConfig = {
            history: "",
            label: "",
            items: [
              {
                label: _t("sort-engine-tokens.sort-in-ascending"),
                onClick: () => {
                  sortTokensInAscending()
                }
              },
              {
                label: _t("sort-engine-tokens.sort-in-descending"),
                onClick: () => {
                  sortTokensInDescending()
                }
              },
              {
                label: _t("sort-engine-tokens.sort-by-balance"),
                onClick: () => {
                  sortTokensbyStake()
                }
              },
              {
                label: _t("sort-engine-tokens.sort-by-stake"),
                onClick: () => {
                  sortTokensbyBalance()
                }
              },
              {
                label: _t("sort-engine-tokens.sort-by-delegations-in"),
                onClick: () => {
                  sortByDelegationIn()
                }
              },
              {
                label: _t("sort-engine-tokens.sort-by-delegations-out"),
                onClick: () => {
                  sortByDelegationOut()
                }
              },
              {
                label: _t("sort-engine-tokens.sort-by-precision"),
                onClick: () => {
                  sortByPrecision()
                }
              }
            ]
          };
        return (
          <div className="amount-actions">
           <DropDown {...dropDownConfig} label={"Sort engine tokens"} float="top" />
          </div>
        );
      })()}

    </div>
    </div>
  )
}
