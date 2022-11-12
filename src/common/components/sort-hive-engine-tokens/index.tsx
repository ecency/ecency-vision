import React, { useState, useEffect } from "react";
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
    sortByDelegationOut
  } = props;

  const [sortLabel, setSortLabel] = useState(_t("sort-engine-tokens.sort"));

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
                label: <span id="ascending">{_t("sort-engine-tokens.sort-in-ascending")}</span>,
                onClick: () => {
                  sortTokensInAscending();
                  setSortLabel(_t("sort-engine-tokens.sort-in-ascending"));
                }
              },
              {
                label: <span id="descending">{_t("sort-engine-tokens.sort-in-descending")}</span>,
                onClick: () => {
                  sortTokensInDescending();
                  setSortLabel(_t("sort-engine-tokens.sort-in-descending"));
                }
              },
              {
                label: <span id="by-value">{_t("sort-engine-tokens.sort-by-value")}</span>,
                onClick: () => {
                  sortTokensbyValue();
                  setSortLabel(_t("sort-engine-tokens.sort-by-value"));
                }
              },
              {
                label: <span id="by-balance">{_t("sort-engine-tokens.sort-by-balance")}</span>,
                onClick: () => {
                  sortTokensbyBalance();
                  setSortLabel(_t("sort-engine-tokens.sort-by-balance"));
                }
              },
              {
                label: <span id="by-stake">{_t("sort-engine-tokens.sort-by-stake")}</span>,
                onClick: () => {
                  sortTokensbyStake();
                  setSortLabel(_t("sort-engine-tokens.sort-by-stake"));
                }
              },
              {
                label: (
                  <span id="delegations-in">{_t("sort-engine-tokens.sort-by-delegations-in")}</span>
                ),
                onClick: () => {
                  sortByDelegationIn();
                  setSortLabel(_t("sort-engine-tokens.sort-by-delegations-in"));
                }
              },
              {
                label: (
                  <span id="delegations-out">
                    {_t("sort-engine-tokens.sort-by-delegations-out")}
                  </span>
                ),
                onClick: () => {
                  sortByDelegationOut();
                  setSortLabel(_t("sort-engine-tokens.sort-by-delegations-out"));
                }
              }
            ]
          };
          return (
            <div className="amount-actions">
              <span className="sort-svg">{sortSvg} </span>
              <DropDown {...dropDownConfig} float="top" />
            </div>
          );
        })()}
      </div>
    </div>
  );
};
