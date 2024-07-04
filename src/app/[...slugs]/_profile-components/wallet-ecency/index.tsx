"use client";
import React, { Fragment, useState } from "react";
import "./_index.scss";

import {
  accountGroupSvg,
  accountOutlineSvg,
  checkAllSvg,
  chevronUpSvg,
  commentSvg,
  pencilOutlineSvg,
  plusCircle,
  repeatSvg,
  starOutlineSvg,
  ticketSvg
} from "@/assets/img/svg";
import {
  EntryLink,
  error,
  FormattedCurrency,
  LinearProgress,
  Promote,
  PurchaseQrDialog,
  PurchaseTypes,
  success,
  Transfer
} from "@/features/shared";
import { Account } from "@/entities";
import { WalletMenu } from "../wallet-menu";
import i18next from "i18next";
import { QueryIdentifiers } from "@/core/react-query";
import { claimPoints, getCurrencyTokenRate } from "@/api/private-api";
import { useGlobalStore } from "@/core/global-store";
import { usePointsQuery } from "@/api/queries";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { TransactionType } from "@/enums";
import { Tooltip } from "@ui/tooltip";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import { menuDownSvg } from "@ui/svg";
import { FormControl } from "@ui/input";
import { WalletEcencyTransactionRow } from "@/app/[...slugs]/_profile-components/wallet-ecency/wallet-ecency-transaction-row";
import useMount from "react-use/lib/useMount";

export const formatMemo = (memo: string) => {
  return memo.split(" ").map((x) => {
    if (x.indexOf("/") >= 3) {
      const [author, permlink] = x.split("/");
      return (
        <Fragment key={x}>
          <EntryLink entry={{ category: "ecency", author: author.replace("@", ""), permlink }}>
            <span>
              {"@"}
              {author.replace("@", "")}/{permlink}
            </span>
          </EntryLink>{" "}
        </Fragment>
      );
    }

    return <Fragment key={x}>{x} </Fragment>;
  });
};

interface Props {
  account: Account;
}

export const WalletEcency = ({ account }: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const currency = useGlobalStore((s) => s.currency);
  const activeUser = useGlobalStore((s) => s.activeUser);
  const updateActiveUser = useGlobalStore((s) => s.updateActiveUser);
  const usePrivate = useGlobalStore((s) => s.usePrivate);

  const [claiming, setClaiming] = useState(false);
  const [purchase, setPurchase] = useState(false);
  const [promote, setPromote] = useState(false);
  const [boost, setBoost] = useState(false);
  const [transfer, setTransfer] = useState(false);
  const [estimatedPointsValue, setEstimatedPointsValue] = useState(0);
  const [estimatedPointsValueLoading, setEstimatedPointsValueLoading] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [filter, setFilter] = useState(0);

  const { data: points, isLoading } = usePointsQuery(account.name, filter);

  const queryClient = useQueryClient();

  useMount(() => {
    if (!usePrivate) {
      router.push("/");
    }
    let user = pathname.split("/")[1];
    user = user.replace("@", "");
    getEstimatedPointsValue();
  });

  const getEstimatedPointsValue = () => {
    setEstimatedPointsValueLoading(true);
    getCurrencyTokenRate(currency, "estm")
      .then((res) => {
        setEstimatedPointsValue(res);
        setEstimatedPointsValueLoading(false);
      })
      .catch((error) => {
        setEstimatedPointsValueLoading(false);
        setEstimatedPointsValue(0);
      });
  };

  const claim = (e?: React.MouseEvent<HTMLAnchorElement>) => {
    if (e) e.preventDefault();

    setClaiming(true);
    const username = activeUser?.username!;
    claimPoints(username)
      .then(() => {
        success(i18next.t("points.claim-ok"));
        queryClient.invalidateQueries({
          queryKey: [QueryIdentifiers.POINTS, account.name, filter]
        });
        updateActiveUser();
      })
      .catch(() => {
        error(i18next.t("g.server-error"));
      })
      .finally(() => {
        setClaiming(false);
      });
  };

  const togglePurchase = (e?: React.MouseEvent<HTMLAnchorElement>) => {
    if (e) e.preventDefault();
    setPurchase(!purchase);
  };

  const togglePromote = () => {
    setPromote(!promote);
  };

  const toggleTransfer = () => {
    setTransfer(!transfer);
  };

  const toggleBoost = () => {
    setBoost(!boost);
  };

  const filterChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(Number(e.target.value));
  };

  if (!usePrivate) {
    return null;
  }

  const isMyPage = activeUser && activeUser.username === account.name;

  // const dropDownConfig = {
  //     history: history,
  //     label: '',
  //     items: [{
  //         label: i18next.t('points.transfer'),
  //         onClick: toggleTransfer
  //     }, {
  //         label: i18next.t('points.promote'),
  //         onClick: togglePromote
  //     }, {
  //         label: i18next.t('points.boost'),
  //         onClick: toggleBoost
  //     }]
  // };

  const txFilters = [
    TransactionType.CHECKIN,
    TransactionType.LOGIN,
    TransactionType.CHECKIN_EXTRA,
    TransactionType.POST,
    TransactionType.COMMENT,
    TransactionType.VOTE,
    TransactionType.REBLOG,
    TransactionType.DELEGATION,
    TransactionType.REFERRAL,
    TransactionType.COMMUNITY,
    TransactionType.TRANSFER_SENT,
    TransactionType.TRANSFER_INCOMING
  ];

  return (
    <>
      <div className="wallet-ecency">
        <div className="wallet-main">
          <div className="wallet-info">
            {points.uPoints !== "0.000" && (
              <>
                <div className="unclaimed-rewards">
                  <div className="title">{i18next.t("points.unclaimed-points")}</div>
                  <div className="rewards">
                    <span className="reward-type">{`${points.uPoints}`}</span>
                    {isMyPage && (
                      <Tooltip content={i18next.t("points.claim-reward-points")}>
                        <a className={`claim-btn ${claiming ? "in-progress" : ""}`} onClick={claim}>
                          {plusCircle}
                        </a>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="balance-row alternative">
              <div className="balance-info">
                <div className="title">{"Ecency Points"}</div>
                <div className="description">{i18next.t("points.main-description")}</div>
              </div>
              <div className="balance-values">
                <div className="amount">
                  <div className="amount-actions">
                    <Dropdown>
                      <DropdownToggle>{menuDownSvg}</DropdownToggle>
                      <DropdownMenu align="right">
                        {isMyPage && (
                          <>
                            <DropdownItem onClick={toggleTransfer}>
                              {i18next.t("points.transfer")}
                            </DropdownItem>
                            <DropdownItem onClick={togglePromote}>
                              {i18next.t("points.promote")}
                            </DropdownItem>
                          </>
                        )}
                        {activeUser && (
                          <DropdownItem onClick={toggleTransfer}>
                            {i18next.t("points.transfer")}
                          </DropdownItem>
                        )}
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  {/* {isMyPage && (
                                        <div className="amount-actions">
                                            <DropDown {...dropDownConfig} float="right"/>
                                        </div>
                                    )} */}
                  <>
                    {points.points} {"POINTS"}
                  </>
                </div>
              </div>
            </div>

            <div className="balance-row estimated alternative">
              <div className="balance-info">
                <div className="title">{i18next.t("wallet.estimated-points")}</div>
                <div className="description">
                  {i18next.t("wallet.estimated-description-points")}
                </div>
              </div>
              <div className="balance-values">
                <div className="amount amount-bold">
                  {estimatedPointsValueLoading ? (
                    `${i18next.t("wallet.calculating")}...`
                  ) : (
                    <FormattedCurrency
                      value={estimatedPointsValue * parseFloat(points.points)}
                      fixAt={3}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="get-points">
              <div className="points-types">
                <div className="points-types-title">{i18next.t("points.earn-points")}</div>
                <div className="points-types-list">
                  <Tooltip content={i18next.t("points.post-desc")}>
                    <div className="point-reward-type">
                      {pencilOutlineSvg}
                      <span className="reward-num">15</span>
                    </div>
                  </Tooltip>
                  <Tooltip content={i18next.t("points.comment-desc")}>
                    <div className="point-reward-type">
                      {commentSvg}
                      <span className="reward-num">5</span>
                    </div>
                  </Tooltip>
                  <Tooltip content={i18next.t("points.vote-desc")}>
                    <div className="point-reward-type">
                      {chevronUpSvg}
                      <span className="reward-num">0.3</span>
                    </div>
                  </Tooltip>
                  <Tooltip content={i18next.t("points.reblog-desc")}>
                    <div className="point-reward-type">
                      {repeatSvg}
                      <span className="reward-num">1</span>
                    </div>
                  </Tooltip>
                  <Tooltip content={i18next.t("points.checkin-desc")}>
                    <div className="point-reward-type">
                      {starOutlineSvg}
                      <span className="reward-num">0.25</span>
                    </div>
                  </Tooltip>
                  <Tooltip content={i18next.t("points.login-desc")}>
                    <div className="point-reward-type">
                      {accountOutlineSvg}
                      <span className="reward-num">10</span>
                    </div>
                  </Tooltip>
                  <Tooltip content={i18next.t("points.checkin-extra-desc")}>
                    <div className="point-reward-type">
                      {checkAllSvg}
                      <span className="reward-num">10</span>
                    </div>
                  </Tooltip>
                  <Tooltip content={i18next.t("points.delegation-desc")}>
                    <div className="point-reward-type">
                      {ticketSvg}
                      <span className="reward-num">10</span>
                    </div>
                  </Tooltip>
                  <Tooltip content={i18next.t("points.community-desc")}>
                    <div className="point-reward-type">
                      {accountGroupSvg}
                      <span className="reward-num">20</span>
                    </div>
                  </Tooltip>
                </div>
              </div>
              {isMyPage && (
                <div className="buy-points">
                  <a href="#" onClick={() => setShowPurchaseDialog(true)}>
                    {" "}
                    {i18next.t("points.get")}
                  </a>
                </div>
              )}
            </div>

            <div className="p-transaction-list">
              <div className="transaction-list-header">
                <h2>{i18next.t("points.history")}</h2>
                <FormControl type="select" value={filter} onChange={filterChanged}>
                  <option value="0">{i18next.t("points.filter-all")}</option>
                  {txFilters.map((x) => (
                    <option key={x} value={x}>
                      {i18next.t(`points.filter-${x}`)}
                    </option>
                  ))}
                </FormControl>
              </div>

              {(() => {
                if (isLoading) {
                  return <LinearProgress />;
                }

                return (
                  <div className="transaction-list-body">
                    {points.transactions.map((tr) => (
                      <WalletEcencyTransactionRow tr={tr} key={tr.id} />
                    ))}
                    {!isLoading && points.transactions.length === 0 && (
                      <p className="text-gray-600 empty-list">{i18next.t("g.empty-list")}</p>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          <WalletMenu username={account.name} active="ecency" />
        </div>

        {transfer && (
          <Transfer
            mode="transfer"
            asset="POINT"
            to={isMyPage ? undefined : account.name}
            onHide={toggleTransfer}
          />
        )}

        {promote && <Promote onHide={togglePromote} />}
        <PurchaseQrDialog
          type={PurchaseTypes.POINTS}
          show={showPurchaseDialog}
          setShow={(v: boolean) => setShowPurchaseDialog(v)}
        />
      </div>
    </>
  );
};
