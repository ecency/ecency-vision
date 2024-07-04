import React, { useMemo, useState } from "react";
import i18next from "i18next";
import { sortSvg } from "@ui/svg";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "@ui/dropdown";

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

  const [sortLabel, setSortLabel] = useState(i18next.t("sort-engine-tokens.sort"));

  const items = useMemo(
    () => [
      {
        label: <span id="ascending">{i18next.t("sort-engine-tokens.sort-in-ascending")}</span>,
        onClick: () => {
          sortTokensInAscending();
          setSortLabel(i18next.t("sort-engine-tokens.sort-in-ascending"));
        }
      },
      {
        label: <span id="descending">{i18next.t("sort-engine-tokens.sort-in-descending")}</span>,
        onClick: () => {
          sortTokensInDescending();
          setSortLabel(i18next.t("sort-engine-tokens.sort-in-descending"));
        }
      },
      {
        label: <span id="by-value">{i18next.t("sort-engine-tokens.sort-by-value")}</span>,
        onClick: () => {
          sortTokensbyValue();
          setSortLabel(i18next.t("sort-engine-tokens.sort-by-value"));
        }
      },
      {
        label: <span id="by-balance">{i18next.t("sort-engine-tokens.sort-by-balance")}</span>,
        onClick: () => {
          sortTokensbyBalance();
          setSortLabel(i18next.t("sort-engine-tokens.sort-by-balance"));
        }
      },
      {
        label: <span id="by-stake">{i18next.t("sort-engine-tokens.sort-by-stake")}</span>,
        onClick: () => {
          sortTokensbyStake();
          setSortLabel(i18next.t("sort-engine-tokens.sort-by-stake"));
        }
      },
      {
        label: (
          <span id="delegations-in">{i18next.t("sort-engine-tokens.sort-by-delegations-in")}</span>
        ),
        onClick: () => {
          sortByDelegationIn();
          setSortLabel(i18next.t("sort-engine-tokens.sort-by-delegations-in"));
        }
      },
      {
        label: (
          <span id="delegations-out">
            {i18next.t("sort-engine-tokens.sort-by-delegations-out")}
          </span>
        ),
        onClick: () => {
          sortByDelegationOut();
          setSortLabel(i18next.t("sort-engine-tokens.sort-by-delegations-out"));
        }
      }
    ],
    [
      sortByDelegationIn,
      sortByDelegationOut,
      sortTokensInAscending,
      sortTokensInDescending,
      sortTokensbyBalance,
      sortTokensbyStake,
      sortTokensbyValue
    ]
  );

  return (
    <div className="balance-values">
      <div className="amount">
        <div className="amount-actions">
          <span className="sort-svg">{sortSvg}</span>
          <Dropdown>
            <DropdownToggle>{sortLabel}</DropdownToggle>
            <DropdownMenu align="top">
              {items.map((item, i) => (
                <DropdownItem key={i} onClick={item.onClick}>
                  {item.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};
