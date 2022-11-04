import React, { useState, useEffect } from 'react'
import DropDown, { MenuItem } from "../dropdown";
import { _t } from "../../i18n";
import { sortSvg } from "../../img/svg";

export const SortEngineTokens = (props: any) => {
    
  const {
    sortTokensInAscending,
    sortTokensInDescending,
    sortTokensbyValue,
    sortTokensbyStake,
    sortTokensbyBalance,
    sortByDelegationIn,
    sortByDelegationOut,
  } = props;
    
const [sortLabel, setSortLabel] = useState(_t("sort-engine-tokens.sort"))

  return (

    <div className="balance-values">
    <div className="amount">
      {(() => {
        let dropDownConfig: any;
          dropDownConfig = {
            history: "",
            label: sortLabel,
            items: [
              {
                label: _t("sort-engine-tokens.sort-in-ascending"),
                onClick: () => {
                  sortTokensInAscending()
                  setSortLabel( _t("sort-engine-tokens.sort-in-ascending"))
                }
              },
              {
                label: _t("sort-engine-tokens.sort-in-descending"),
                onClick: () => {
                  sortTokensInDescending()
                  setSortLabel(_t("sort-engine-tokens.sort-in-descending"))
                }
              },
              {
                label: _t("sort-engine-tokens.sort-by-value"),
                onClick: () => {
                  sortTokensbyValue()
                  setSortLabel(_t("sort-engine-tokens.sort-by-value"))
                }
              },
              {
                label: _t("sort-engine-tokens.sort-by-balance"),
                onClick: () => {
                  sortTokensbyBalance()
                  setSortLabel(_t("sort-engine-tokens.sort-by-balance"))
                }
              },
              {
                label: _t("sort-engine-tokens.sort-by-stake"),
                onClick: () => {
                  sortTokensbyStake()
                  setSortLabel(_t("sort-engine-tokens.sort-by-stake"))
                }
              },
              {
                label: _t("sort-engine-tokens.sort-by-delegations-in"),
                onClick: () => {
                  sortByDelegationIn()
                  setSortLabel(_t("sort-engine-tokens.sort-by-delegations-in"))
                }
              },
              {
                label: _t("sort-engine-tokens.sort-by-delegations-out"),
                onClick: () => {
                  sortByDelegationOut()
                  setSortLabel(_t("sort-engine-tokens.sort-by-delegations-out"))
                }
              }
            ]
          };
        return (
          <div className="amount-actions">
             <span className="sort-svg">
                  {sortSvg} {" "}
             </span>
           <DropDown {...dropDownConfig}  float="top" />
          </div>
        );
      })()}

    </div>
    </div>
  )
}
