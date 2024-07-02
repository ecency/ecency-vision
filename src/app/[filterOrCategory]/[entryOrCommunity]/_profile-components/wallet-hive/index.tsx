"use client";

import { AssetSymbol } from "@hiveio/dhive";
import "./_index.scss";
import {
  FormattedCurrency,
  TransactionsList,
  Transfer,
  TransferAsset,
  TransferMode
} from "@/features/shared";
import {
  dateToFullRelative,
  dayDiff,
  formattedNumber,
  HiveWallet,
  hourDiff,
  parseAsset,
  secondDiff,
  vestsToHp
} from "@/utils";
import i18next from "i18next";
import { FullAccount } from "@/entities";
import { menuDownSvg, plusCircle } from "@ui/svg";
import { Tooltip } from "@ui/tooltip";
import { WithdrawRoutesDialog } from "@/app/[filterOrCategory]/[entryOrCommunity]/_profile-components/withdraw-routes";
import { OpenOrdersList } from "../open-orders-list";
import { SavingsWithdraw } from "../savings-withdraw";
import { CollateralizedConversionRequests } from "../converts-collateralized";
import { ConversionRequests } from "../converts";
import { ReceivedVesting } from "../received-vesting";
import { DelegatedVesting } from "../delegated-vesting";
import { WalletMenu } from "../wallet-menu";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import { useMemo, useState } from "react";
import {
  getCollateralizedConversionRequestsQuery,
  getConversionRequestsQuery,
  getDynamicPropsQuery,
  getOpenOrdersQuery,
  getSavingsWithdrawFromQuery
} from "@/api/queries";
import { useGlobalStore } from "@/core/global-store";
import { useRouter } from "next/navigation";
import { useClaimRewardBalance } from "@/api/mutations";

interface Props {
  account: FullAccount;
}

export function WalletHive({ account }: Props) {
  const router = useRouter();

  const activeUser = useGlobalStore((s) => s.activeUser);
  const usePrivate = useGlobalStore((s) => s.usePrivate);

  const { data: dynamicProps } = getDynamicPropsQuery().useClientQuery();
  const { data: openOrdersData } = getOpenOrdersQuery(account.name).useClientQuery();
  const { data: withdrawFromData } = getSavingsWithdrawFromQuery(account.name).useClientQuery();
  const { data: ccrData } = getCollateralizedConversionRequestsQuery(account.name).useClientQuery();
  const { data: crData } = getConversionRequestsQuery(account.name).useClientQuery();

  const [withdrawRoutes, setWithDrawRoutes] = useState(false);
  const [openOrdersList, setOpenOrdersList] = useState(false);
  const [tokenType, setTokenType] = useState<AssetSymbol>("HBD");
  const [savingsWithdrawList, setSavingWithdrawList] = useState(false);
  const [cconvertList, setCconvertList] = useState(false);
  const [convertList, setConverList] = useState(false);
  const [receivedList, setReceivedList] = useState(false);
  const [delegatedList, setDelegatedList] = useState(false);
  const [transfer, setTransfer] = useState(false);
  const [transferMode, setTransferMode] = useState<TransferMode>();
  const [transferAsset, setTransferAsset] = useState<TransferAsset>();

  const hp = useMemo(() => {
    // The inflation was set to 9.5% at block 7m
    const initialInflationRate = 9.5;
    const initialBlock = 7000000;

    // It decreases by 0.01% every 250k blocks
    const decreaseRate = 250000;
    const decreasePercentPerIncrement = 0.01;

    // How many increments have happened since block 7m?
    const headBlock = dynamicProps!.headBlock;
    const deltaBlocks = headBlock - initialBlock;
    const decreaseIncrements = deltaBlocks / decreaseRate;

    // Current inflation rate
    let currentInflationRate =
      initialInflationRate - decreaseIncrements * decreasePercentPerIncrement;

    // Cannot go lower than 0.95%
    if (currentInflationRate < 0.95) {
      currentInflationRate = 0.95;
    }

    // Now lets calculate the "APR"
    const vestingRewardPercent = dynamicProps!.vestingRewardPercent / 10000;
    const virtualSupply = dynamicProps!.virtualSupply;
    const totalVestingFunds = dynamicProps!.totalVestingFund;
    return (
      (virtualSupply * currentInflationRate * vestingRewardPercent) /
      totalVestingFunds
    ).toFixed(3);
  }, [dynamicProps]);
  const converting = useMemo(() => {
    let converting = 0;
    crData?.forEach((x) => {
      converting += parseAsset(x.amount).amount;
    });
    return converting;
  }, [crData]);
  const cconverting = useMemo(() => {
    let cconverting = 0;
    ccrData?.forEach((x) => {
      cconverting += parseAsset(x.collateral_amount).amount;
    });
    return cconverting;
  }, [ccrData]);
  const withdrawSavings = useMemo(() => {
    let ws = { hbd: 0, hive: 0 };
    withdrawFromData?.forEach((x) => {
      const aa = x.amount;
      if (aa.includes("HIVE")) {
        ws.hive += parseAsset(x.amount).amount;
      } else {
        ws.hbd += parseAsset(x.amount).amount;
      }
    });
    return ws;
  }, [withdrawFromData]);
  const openOrders = useMemo(() => {
    let value = { hive: 0, hbd: 0 };
    openOrdersData?.forEach((x) => {
      const bb = x.sell_price.base;
      if (bb.includes("HIVE")) {
        value.hive += parseAsset(bb).amount;
      } else {
        value.hbd += parseAsset(bb).amount;
      }
    });
    return value;
  }, [openOrdersData]);
  const isMyPage = useMemo(
    () => activeUser && activeUser.username === account.name,
    [activeUser, account]
  );
  const w = useMemo(
    () => new HiveWallet(account, dynamicProps!, converting),
    [account, converting, dynamicProps]
  );
  const lastIPaymentRelative = useMemo(
    () =>
      account.savings_hbd_last_interest_payment == "1970-01-01T00:00:00"
        ? null
        : dateToFullRelative(account.savings_hbd_last_interest_payment),
    [account.savings_hbd_last_interest_payment]
  );
  const lastIPaymentDiff = useMemo(
    () =>
      dayDiff(
        account.savings_hbd_last_interest_payment == "1970-01-01T00:00:00"
          ? account.savings_hbd_seconds_last_update
          : account.savings_hbd_last_interest_payment
      ),
    [account.savings_hbd_last_interest_payment, account.savings_hbd_seconds_last_update]
  );
  const remainingHours = useMemo(
    () =>
      720 -
      hourDiff(
        account.savings_hbd_last_interest_payment == "1970-01-01T00:00:00"
          ? account.savings_hbd_seconds_last_update
          : account.savings_hbd_last_interest_payment
      ),
    [account.savings_hbd_last_interest_payment, account.savings_hbd_seconds_last_update]
  );
  const secondsSincePayment = useMemo(
    () => secondDiff(account.savings_hbd_seconds_last_update),
    [account.savings_hbd_seconds_last_update]
  );
  const pendingSeconds = useMemo(
    () => w.savingBalanceHbd * secondsSincePayment,
    [secondsSincePayment, w.savingBalanceHbd]
  );
  const secondsToEstimate = useMemo(
    () => w.savingHbdSeconds / 1000 + pendingSeconds,
    [pendingSeconds, w.savingHbdSeconds]
  );
  const estimatedUIn = useMemo(
    () => (secondsToEstimate / (60 * 60 * 24 * 365)) * (dynamicProps!.hbdInterestRate / 10000),
    [dynamicProps, secondsToEstimate]
  );
  const estimatedInterest = useMemo(
    () => formattedNumber(estimatedUIn, { suffix: "$" }),
    [estimatedUIn]
  );
  const remainingDays = useMemo(() => 30 - lastIPaymentDiff, [lastIPaymentDiff]);
  const totalHP = useMemo(
    () =>
      formattedNumber(vestsToHp(w.vestingShares, dynamicProps!.hivePerMVests), {
        suffix: "HP"
      }),
    [dynamicProps, w.vestingShares]
  );
  const totalDelegated = useMemo(
    () =>
      formattedNumber(vestsToHp(w.vestingSharesDelegated, dynamicProps!.hivePerMVests), {
        prefix: "-",
        suffix: "HP"
      }),
    [dynamicProps, w.vestingSharesDelegated]
  );

  const {
    mutateAsync: claimRewardBalance,
    isPending: claiming,
    isSuccess: claimed
  } = useClaimRewardBalance();

  return (
    <div className="wallet-hive">
      <div className="wallet-main">
        <div className="wallet-info">
          {w.hasUnclaimedRewards && !claimed && (
            <div className="unclaimed-rewards">
              <div className="title">{i18next.t("wallet.unclaimed-rewards")}</div>
              <div className="rewards">
                {w.rewardHiveBalance > 0 && (
                  <span className="reward-type">{`${w.rewardHiveBalance} HIVE`}</span>
                )}
                {w.rewardHbdBalance > 0 && (
                  <span className="reward-type">{`${w.rewardHbdBalance} HBD`}</span>
                )}
                {w.rewardVestingHive > 0 && (
                  <span className="reward-type">{`${w.rewardVestingHive} HP`}</span>
                )}
                {isMyPage && (
                  <Tooltip content={i18next.t("wallet.claim-reward-balance")}>
                    <a
                      className={`claim-btn ${claiming ? "in-progress" : ""}`}
                      onClick={() => claimRewardBalance()}
                    >
                      {plusCircle}
                    </a>
                  </Tooltip>
                )}
              </div>
            </div>
          )}

          <div className="balance-row hive">
            <div className="balance-info">
              <div className="title">{i18next.t("wallet.hive")}</div>
              <div className="description">{i18next.t("wallet.hive-description")}</div>
            </div>
            <div className="balance-values">
              <div className="amount">
                <div className="amount-actions">
                  <Dropdown>
                    <DropdownToggle>{menuDownSvg}</DropdownToggle>
                    <DropdownMenu align="right">
                      {isMyPage && (
                        <>
                          <DropdownItem
                            onClick={() => {
                              setTransfer(true);
                              setTransferMode("transfer");
                              setTransferAsset("HIVE");
                            }}
                          >
                            {i18next.t("wallet.transfer")}
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => {
                              setTransfer(true);
                              setTransferMode("transfer-saving");
                              setTransferAsset("HIVE");
                            }}
                          >
                            {i18next.t("wallet.transfer-to-savings")}
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => {
                              setTransfer(true);
                              setTransferMode("power-up");
                              setTransferAsset("HIVE");
                            }}
                          >
                            {i18next.t("wallet.power-up")}
                          </DropdownItem>
                          <DropdownItem onClick={() => router.push("/market")}>
                            {i18next.t("market-data.trade")}
                          </DropdownItem>
                        </>
                      )}
                      {!isMyPage && activeUser && (
                        <DropdownItem
                          onClick={() => {
                            setTransfer(true);
                            setTransferMode("transfer");
                            setTransferAsset("HIVE");
                          }}
                        >
                          {i18next.t("wallet.transfer")}
                        </DropdownItem>
                      )}
                    </DropdownMenu>
                  </Dropdown>
                </div>

                <span>{formattedNumber(w.balance, { suffix: "HIVE" })}</span>
              </div>
              {cconverting > 0 && (
                <div className="amount amount-passive converting-hbd">
                  <Tooltip content={i18next.t("wallet.converting-hive-amount")}>
                    <span className="amount-btn" onClick={() => setCconvertList(true)}>
                      {"+"} {formattedNumber(cconverting, { suffix: "HIVE" })}
                    </span>
                  </Tooltip>
                </div>
              )}
              {openOrders && openOrders.hive > 0 && (
                <div className="amount amount-passive converting-hbd">
                  <Tooltip content={i18next.t("wallet.reserved-amount")}>
                    <span
                      className="amount-btn"
                      onClick={() => {
                        setOpenOrdersList(true);
                        setTransferAsset("HIVE");
                      }}
                    >
                      {"+"} {formattedNumber(openOrders.hive, { suffix: "HIVE" })}
                    </span>
                  </Tooltip>
                </div>
              )}
              {withdrawSavings && withdrawSavings.hive > 0 && (
                <div className="amount amount-passive converting-hbd">
                  <Tooltip content={i18next.t("wallet.withdrawing-amount")}>
                    <span
                      className="amount-btn"
                      onClick={() => {
                        setSavingWithdrawList(true);
                        setTransferAsset("HIVE");
                      }}
                    >
                      {"+"} {formattedNumber(withdrawSavings.hive, { suffix: "HIVE" })}
                    </span>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>

          <div className="balance-row hive-power alternative">
            <div className="balance-info">
              <div className="title">{i18next.t("wallet.hive-power")}</div>
              <div className="description">{i18next.t("wallet.hive-power-description")}</div>
              <div className="description font-bold mt-2">
                {i18next.t("wallet.hive-power-apr-rate", { value: hp })}
              </div>
            </div>

            <div className="balance-values">
              <div className="amount">
                <div className="amount-actions">
                  <Dropdown>
                    <DropdownToggle>{menuDownSvg}</DropdownToggle>
                    <DropdownMenu align="right">
                      {isMyPage && (
                        <>
                          <DropdownItem
                            onClick={() => {
                              setTransfer(true);
                              setTransferMode("delegate");
                              setTransferAsset("HP");
                            }}
                          >
                            {i18next.t("wallet.delegate")}
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => {
                              setTransfer(true);
                              setTransferMode("power-down");
                              setTransferAsset("HP");
                            }}
                          >
                            {i18next.t("wallet.power-down")}
                          </DropdownItem>
                          <DropdownItem onClick={() => setWithDrawRoutes(true)}>
                            {i18next.t("wallet.withdraw-routes")}
                          </DropdownItem>
                        </>
                      )}
                      {!isMyPage && activeUser && (
                        <>
                          <DropdownItem
                            onClick={() => {
                              setTransfer(true);
                              setTransferMode("delegate");
                              setTransferAsset("HP");
                            }}
                          >
                            {i18next.t("wallet.delegate")}
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => {
                              setTransfer(true);
                              setTransferMode("power-up");
                              setTransferAsset("HIVE");
                            }}
                          >
                            {i18next.t("wallet.power-up")}
                          </DropdownItem>
                        </>
                      )}
                    </DropdownMenu>
                  </Dropdown>
                </div>
                {totalHP}
              </div>

              {w.vestingSharesDelegated > 0 && (
                <div className="amount amount-passive delegated-shares">
                  <Tooltip content={i18next.t("wallet.hive-power-delegated")}>
                    <span className="amount-btn" onClick={() => setDelegatedList(true)}>
                      {formattedNumber(
                        vestsToHp(w.vestingSharesDelegated, dynamicProps!.hivePerMVests),
                        {
                          prefix: "-",
                          suffix: "HP"
                        }
                      )}
                    </span>
                  </Tooltip>
                </div>
              )}

              {(() => {
                if (w.vestingSharesReceived <= 0) {
                  return null;
                }

                const strReceived = formattedNumber(
                  vestsToHp(w.vestingSharesReceived, dynamicProps!.hivePerMVests),
                  { prefix: "+", suffix: "HP" }
                );

                if (usePrivate) {
                  return (
                    <div className="amount amount-passive received-shares">
                      <Tooltip content={i18next.t("wallet.hive-power-received")}>
                        <span className="amount-btn" onClick={() => setReceivedList(true)}>
                          {strReceived}
                        </span>
                      </Tooltip>
                    </div>
                  );
                }

                return (
                  <div className="amount amount-passive received-shares">
                    <Tooltip content={i18next.t("wallet.hive-power-received")}>
                      <span className="amount">{strReceived}</span>
                    </Tooltip>
                  </div>
                );
              })()}

              {w.nextVestingSharesWithdrawal > 0 && (
                <div className="amount amount-passive next-power-down-amount">
                  <Tooltip content={i18next.t("wallet.next-power-down-amount")}>
                    <span>
                      {formattedNumber(
                        vestsToHp(w.nextVestingSharesWithdrawal, dynamicProps!.hivePerMVests),
                        {
                          prefix: "-",
                          suffix: "HP"
                        }
                      )}
                    </span>
                  </Tooltip>
                </div>
              )}

              {(w.vestingSharesDelegated > 0 ||
                w.vestingSharesReceived > 0 ||
                w.nextVestingSharesWithdrawal > 0) && (
                <div className="amount total-hive-power">
                  <Tooltip content={i18next.t("wallet.hive-power-total")}>
                    <span>
                      {formattedNumber(
                        vestsToHp(w.vestingSharesTotal, dynamicProps!.hivePerMVests),
                        {
                          prefix: "=",
                          suffix: "HP"
                        }
                      )}
                    </span>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>

          <div className="balance-row hive-dollars">
            <div className="balance-info">
              <div className="title">{i18next.t("wallet.hive-dollars")}</div>
              <div className="description">{i18next.t("wallet.hive-dollars-description")}</div>
            </div>
            <div className="balance-values">
              <div className="amount">
                <div className="amount-actions">
                  <Dropdown>
                    <DropdownToggle>{menuDownSvg}</DropdownToggle>
                    <DropdownMenu align="right">
                      {isMyPage && (
                        <>
                          <DropdownItem
                            onClick={() => {
                              setTransfer(true);
                              setTransferMode("transfer");
                              setTransferAsset("HBD");
                            }}
                          >
                            {i18next.t("wallet.transfer")}
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => {
                              setTransfer(true);
                              setTransferMode("transfer-saving");
                              setTransferAsset("HBD");
                            }}
                          >
                            {i18next.t("wallet.transfer-to-savings")}
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => {
                              setTransfer(true);
                              setTransferMode("convert");
                              setTransferAsset("HBD");
                            }}
                          >
                            {i18next.t("wallet.convert")}
                          </DropdownItem>
                          <DropdownItem onClick={() => router.push("/market")}>
                            {i18next.t("market-data.trade")}
                          </DropdownItem>
                        </>
                      )}
                      {activeUser && (
                        <DropdownItem
                          onClick={() => {
                            setTransfer(true);
                            setTransferMode("transfer");
                            setTransferAsset("HBD");
                          }}
                        >
                          {i18next.t("wallet.transfer")}
                        </DropdownItem>
                      )}
                    </DropdownMenu>
                  </Dropdown>
                </div>
                <span>{formattedNumber(w.hbdBalance, { prefix: "$" })}</span>
              </div>

              {converting > 0 && (
                <div className="amount amount-passive converting-hbd">
                  <Tooltip content={i18next.t("wallet.converting-hbd-amount")}>
                    <span className="amount-btn" onClick={() => setConverList(true)}>
                      {"+"} {formattedNumber(converting, { prefix: "$" })}
                    </span>
                  </Tooltip>
                </div>
              )}

              {withdrawSavings && withdrawSavings.hbd > 0 && (
                <div className="amount amount-passive converting-hbd">
                  <Tooltip content={i18next.t("wallet.withdrawing-amount")}>
                    <span
                      className="amount-btn"
                      onClick={() => {
                        setSavingWithdrawList(true);
                        setTransferAsset("HBD");
                      }}
                    >
                      {"+"} {formattedNumber(withdrawSavings.hbd, { prefix: "$" })}
                    </span>
                  </Tooltip>
                </div>
              )}

              {openOrders && openOrders.hbd > 0 && (
                <div className="amount amount-passive converting-hbd">
                  <Tooltip content={i18next.t("wallet.reserved-amount")}>
                    <span
                      className="amount-btn"
                      onClick={() => {
                        setOpenOrdersList(true);
                        setTransferAsset("HBD");
                      }}
                    >
                      {"+"} {formattedNumber(openOrders.hbd, { prefix: "$" })}
                    </span>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>

          <div className="balance-row savings alternative">
            <div className="balance-info">
              <div className="title">{i18next.t("wallet.savings")}</div>
              <div className="description">{i18next.t("wallet.savings-description")}</div>
              <div className="description font-bold mt-2">
                {i18next.t("wallet.hive-dollars-apr-rate", {
                  value: dynamicProps!.hbdInterestRate / 100
                })}
              </div>
              {estimatedUIn >= 0.001 && (
                <div className="description font-bold mt-2">
                  {i18next.t("wallet.hive-dollars-apr-claim", { value: lastIPaymentRelative })}{" "}
                  {estimatedInterest}
                </div>
              )}
              {isMyPage && estimatedUIn >= 0.001 && (
                <div className="unclaimed-rewards" style={{ marginBottom: "0" }}>
                  <div className="rewards" style={{ height: "40px" }}>
                    <a
                      className={`claim-btn ${remainingHours > 0 ? "disabled" : ""}`}
                      onClick={() => {
                        setTransfer(true);
                        setTransferMode("claim-interest");
                        setTransferAsset("HBD");
                      }}
                    >
                      {remainingDays > 0
                        ? i18next.t("wallet.hive-dollars-apr-day", { value: remainingDays })
                        : remainingDays == 0 && remainingHours > 0
                          ? i18next.t("wallet.hive-dollars-apr-hour", { value: remainingHours })
                          : i18next.t("wallet.hive-dollars-apr-now")}{" "}
                      {plusCircle}
                    </a>
                  </div>
                </div>
              )}
            </div>
            <div className="balance-values">
              <div className="amount">
                <Dropdown>
                  <DropdownToggle>{menuDownSvg}</DropdownToggle>
                  <DropdownMenu align="right">
                    {isMyPage ? (
                      <DropdownItem
                        onClick={() => {
                          setTransfer(true);
                          setTransferMode("withdraw-saving");
                          setTransferAsset("HIVE");
                        }}
                      >
                        {i18next.t("wallet.withdraw-hive")}
                      </DropdownItem>
                    ) : (
                      <DropdownItem
                        onClick={() => {
                          setTransfer(true);
                          setTransferMode("transfer-saving");
                          setTransferAsset("HIVE");
                        }}
                      >
                        {i18next.t("wallet.transfer")}
                      </DropdownItem>
                    )}
                  </DropdownMenu>
                </Dropdown>
                <span>{formattedNumber(w.savingBalance, { suffix: "HIVE" })}</span>
              </div>
              <div className="amount">
                <div className="amount-actions">
                  <Dropdown>
                    <DropdownToggle>{menuDownSvg}</DropdownToggle>
                    <DropdownMenu align="right">
                      {isMyPage ? (
                        <DropdownItem
                          onClick={() => {
                            setTransfer(true);
                            setTransferMode("withdraw-saving");
                            setTransferAsset("HBD");
                          }}
                        >
                          {i18next.t("wallet.withdraw-hbd")}
                        </DropdownItem>
                      ) : (
                        <DropdownItem
                          onClick={() => {
                            setTransfer(true);
                            setTransferMode("transfer-saving");
                            setTransferAsset("HBD");
                          }}
                        >
                          {i18next.t("wallet.transfer")}
                        </DropdownItem>
                      )}
                    </DropdownMenu>
                  </Dropdown>
                </div>

                <span>{formattedNumber(w.savingBalanceHbd, { suffix: "$" })}</span>
              </div>
            </div>
          </div>

          <div className="balance-row estimated alternative">
            <div className="balance-info">
              <div className="title">{i18next.t("wallet.estimated")}</div>
              <div className="description">{i18next.t("wallet.estimated-description")}</div>
            </div>
            <div className="balance-values">
              <div className="amount amount-bold">
                <FormattedCurrency value={w.estimatedValue} fixAt={3} />
              </div>
            </div>
          </div>

          {w.isPoweringDown && (
            <div
              className="next-power-down"
              title={`${hourDiff(w.nextVestingWithdrawalDate.toString())}h`}
            >
              {i18next.t("wallet.next-power-down", {
                time: dateToFullRelative(w.nextVestingWithdrawalDate.toString()),
                amount: formattedNumber(w.nextVestingSharesWithdrawalHive, { suffix: "HIVE" }),
                weeks: w.weeksLeft
              })}
            </div>
          )}

          <TransactionsList account={account} />
        </div>
        <WalletMenu username={account.name} active="hive" />
      </div>

      {transfer && (
        <Transfer
          to={isMyPage ? undefined : account.name}
          mode={transferMode!}
          asset={transferAsset!}
          onHide={() => {
            setTransfer(false);
            setTransferMode(undefined);
            setTransferAsset("HBD");
          }}
        />
      )}

      {delegatedList && (
        <DelegatedVesting
          account={account}
          onHide={() => setDelegatedList(false)}
          totalDelegated={totalDelegated.replace("- ", "")}
        />
      )}

      {receivedList && <ReceivedVesting account={account} onHide={() => setReceivedList(false)} />}

      {convertList && <ConversionRequests account={account} onHide={() => setConverList(false)} />}

      {cconvertList && (
        <CollateralizedConversionRequests account={account} onHide={() => setCconvertList(false)} />
      )}

      {savingsWithdrawList && (
        <SavingsWithdraw
          tokenType={tokenType}
          account={account}
          onHide={() => {
            setTokenType("HBD");
            setSavingWithdrawList(false);
          }}
        />
      )}

      {openOrdersList && (
        <OpenOrdersList
          tokenType={tokenType}
          account={account}
          onHide={() => {
            setTokenType("HBD");
            setOpenOrdersList(false);
          }}
        />
      )}

      {withdrawRoutes && <WithdrawRoutesDialog onHide={() => setWithDrawRoutes(false)} />}
    </div>
  );
}
