import { TransferFormHeader } from "@/features/shared/transfer/transfer-form-header";
import i18next from "i18next";
import { Button } from "@ui/button";
import { LinearProgress, SuggestionList, TransferAsset, UserAvatar } from "@/features/shared";
import { Form } from "@ui/form";
import { FormControl, InputGroup } from "@ui/input";
import React, { useCallback, useEffect, useMemo } from "react";
import {
  dateToFullRelative,
  formatNumber,
  formattedNumber,
  HiveWallet,
  parseAsset,
  vestsToHp
} from "@/utils";
import { useGlobalStore } from "@/core/global-store";
import { getDynamicPropsQuery, getPointsQuery, getTransactionsQuery } from "@/api/queries";
import { TransferFormText } from "@/features/shared/transfer/transfer-form-text";
import { TransferAssetSwitch } from "@/features/shared/transfer/transfer-assets-switch";
import { EXCHANGE_ACCOUNTS } from "@/consts";
import { useTransferSharedState } from "./transfer-shared-state";
import { useDebounceTransferAccountData } from "./use-debounce-transfer-account-data";
import { amountFormatCheck } from "@/utils/amount-format-check";
import { cryptoUtils } from "@hiveio/dhive";

interface Props {
  titleLngKey: string;
}

export function TransferStep1({ titleLngKey }: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const usePrivate = useGlobalStore((s) => s.usePrivate);

  const {
    asset,
    memo,
    setMemo,
    step,
    to,
    mode,
    setExchangeWarning,
    setTo,
    setStep,
    setAmount,
    amount,
    amountError,
    setAmountError,
    memoError,
    setMemoError,
    exchangeWarning,
    setAsset
  } = useTransferSharedState();

  const { data: activeUserPoints } = getPointsQuery(activeUser?.username).useClientQuery();
  const { data: dynamicProps } = getDynamicPropsQuery().useClientQuery();
  const { data: transactions, isLoading: inProgress } = getTransactionsQuery(
    activeUser?.username
  ).useClientQuery();
  const { toWarning, toData, delegatedAmount, toError, delegateAccount } =
    useDebounceTransferAccountData();

  const transactionsFlow = useMemo(
    () => transactions?.pages.reduce((acc, page) => [...acc, ...page], []) ?? [],
    [transactions]
  );
  const w = useMemo(
    () => new HiveWallet(activeUser!.data, dynamicProps!),
    [activeUser, dynamicProps]
  );
  const subTitleLngKey = useMemo(() => `${mode}-sub-title`, [mode]);
  const recent = useMemo(
    () =>
      Array.from(
        new Set(
          transactionsFlow
            .filter(
              (x) =>
                (x.type === "transfer" && x.from === activeUser?.username) ||
                (x.type === "delegate_vesting_shares" && x.delegator === activeUser?.username)
            )
            .map((x) =>
              x.type === "transfer" ? x.to : x.type === "delegate_vesting_shares" ? x.delegatee : ""
            )
            .filter((x) => {
              if (to!.trim() === "") {
                return true;
              }

              return x.indexOf(to!) !== -1;
            })
            .reverse()
            .slice(0, 5)
        ) ?? []
      ),
    [activeUser?.username, to, transactionsFlow]
  );
  const canSubmit = useMemo(
    () =>
      toData &&
      !toError &&
      !amountError &&
      !memoError &&
      !inProgress &&
      !exchangeWarning &&
      parseFloat(amount) > 0,
    [amount, amountError, exchangeWarning, inProgress, memoError, toData, toError]
  );
  const assets = useMemo(() => {
    let assets: TransferAsset[] = [];
    switch (mode) {
      case "transfer":
        if (usePrivate) {
          assets = ["HIVE", "HBD", "POINT"];
        } else {
          assets = ["HIVE", "HBD"];
        }
        break;
      case "transfer-saving":
      case "withdraw-saving":
        assets = ["HIVE", "HBD"];
        break;
      case "claim-interest":
        assets = ["HBD"];
        break;
      case "convert":
        assets = ["HBD"];
        break;
      case "power-up":
        assets = ["HIVE"];
        break;
      case "power-down":
      case "delegate":
        assets = ["HP"];
        break;
    }

    return assets;
  }, [mode, usePrivate]);
  const showTo = useMemo(
    () => ["transfer", "transfer-saving", "withdraw-saving", "power-up", "delegate"].includes(mode),
    [mode]
  );
  const showMemo = useMemo(
    () => ["transfer", "transfer-saving", "withdraw-saving"].includes(mode),
    [mode]
  );

  const getBalance = useCallback((): number => {
    if (asset === "POINT") {
      return parseAsset(activeUserPoints?.points ?? "0.0").amount;
    }
    const w = new HiveWallet(activeUser!.data, dynamicProps!);

    if (mode === "withdraw-saving" || mode === "claim-interest") {
      return asset === "HIVE" ? w.savingBalance : w.savingBalanceHbd;
    }

    if (asset === "HIVE") {
      return w.balance;
    }

    if (asset === "HBD") {
      return w.hbdBalance;
    }

    if (asset === "HP") {
      const { hivePerMVests } = dynamicProps!;
      const vestingShares = w.vestingSharesAvailable;
      return vestsToHp(vestingShares, hivePerMVests);
    }

    return 0;
  }, [activeUser, asset, dynamicProps, mode]);

  useEffect(() => {
    if (amount === "") {
      setAmountError("");
      return;
    }

    if (!amountFormatCheck(amount)) {
      setAmountError(i18next.t("transfer.wrong-amount"));
      return;
    }

    const dotParts = amount.split(".");
    if (dotParts.length > 1) {
      const precision = dotParts[1];
      if (precision.length > 3) {
        setAmountError(i18next.t("transfer.amount-precision-error"));
        return;
      }
    }

    let balance = Number(formatNumber(getBalance(), 3));

    if (parseFloat(amount) > balance + delegatedAmount) {
      setAmountError(i18next.t("trx-common.insufficient-funds"));
      return;
    }

    setAmountError("");
  }, [amount, delegatedAmount, getBalance, setAmountError]);

  const balance = useMemo(() => {
    let balance: string | number = formatNumber(getBalance(), 3);
    if (delegatedAmount) {
      balance = Number(balance) + delegatedAmount;
      balance = Number(balance).toFixed(3);
    }

    return balance;
  }, [delegatedAmount, getBalance]);

  const exchangeHandler = useCallback(
    (to: string, memo: string) => {
      if (EXCHANGE_ACCOUNTS.includes(to)) {
        if ((asset === "HIVE" || asset === "HBD") && !memo) {
          setExchangeWarning(i18next.t("transfer.memo-required"));
        } else {
          setExchangeWarning("");
        }
      }
    },
    [asset, setExchangeWarning]
  );

  const toChanged = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value: to } = e.target;
      setTo(to);
      exchangeHandler(to, memo);
    },
    [exchangeHandler, memo, setTo]
  );

  const nextPowerDown = useCallback(() => {
    setStep(2);
    setAmount("0.000");
  }, [setAmount, setStep]);

  const next = useCallback(() => {
    // make sure 3 decimals in amount
    const fixedAmount = formatNumber(amount, 3);
    setAmount(fixedAmount);
    setStep(2);
  }, [amount, setAmount, setStep]);

  const memoChanged = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const { value: memo } = e.target;
      const mError = cryptoUtils.isWif(memo.trim());
      if (mError) setMemoError(i18next.t("transfer.memo-error").toUpperCase());
      setMemo(memo);
      exchangeHandler(to, memo);
    },
    [exchangeHandler, setMemo, setMemoError, to]
  );

  return (
    <>
      {step === 1 && mode === "power-down" && (
        <div className="transfer-dialog-content">
          <div className="transaction-form">
            <TransferFormHeader title={titleLngKey} step={step} subtitle={subTitleLngKey} />
            <div className="transaction-form-body powering-down">
              <p>{i18next.t("transfer.powering-down")}</p>
              <p>
                {" "}
                {i18next.t("wallet.next-power-down", {
                  time: dateToFullRelative(w.nextVestingWithdrawalDate.toString()),
                  amount: `${formatNumber(w.nextVestingSharesWithdrawalHive, 3)} HIVE`,
                  weeks: w.weeksLeft
                })}
              </p>
              <p>
                <Button onClick={nextPowerDown} appearance="danger">
                  {i18next.t("transfer.stop-power-down")}
                </Button>
              </p>
            </div>
          </div>
        </div>
      )}
      {step === 1 && mode !== "power-down" && (
        <div className={`transaction-form ${inProgress ? "in-progress" : ""}`}>
          <TransferFormHeader title={titleLngKey} step={step} subtitle={subTitleLngKey} />
          {inProgress && <LinearProgress />}
          <Form className="transaction-form-body">
            <div className="grid items-center grid-cols-12 mb-4">
              <div className="col-span-12 sm:col-span-2">
                <label>{i18next.t("transfer.from")}</label>
              </div>
              <div className="col-span-12 sm:col-span-10">
                <InputGroup prepend="@">
                  <FormControl type="text" value={activeUser!.username} readOnly={true} />
                </InputGroup>
              </div>
            </div>

            {showTo && (
              <>
                <div className="grid items-center grid-cols-12 mb-4">
                  <div className="col-span-12 sm:col-span-2">
                    <label>{i18next.t("transfer.to")}</label>
                  </div>
                  <div className="col-span-12 sm:col-span-10">
                    <SuggestionList
                      onSelect={(to: string) => {
                        setTo(to);
                        exchangeHandler(to, memo);
                      }}
                      items={recent}
                      renderer={(i) => (
                        <>
                          <UserAvatar username={i} size="medium" />
                          <span style={{ marginLeft: "4px" }}>{i}</span>
                        </>
                      )}
                      header={i18next.t("transfer.recent-transfers")}
                    >
                      <InputGroup prepend="@">
                        <FormControl
                          type="text"
                          autoFocus={to === ""}
                          placeholder={i18next.t("transfer.to-placeholder")}
                          value={to}
                          onChange={toChanged}
                          className={toError ? "is-invalid" : ""}
                        />
                      </InputGroup>
                    </SuggestionList>
                  </div>
                </div>
                {toWarning && <TransferFormText msg={toWarning} type="danger" />}
                {toError && (
                  <TransferFormText msg={i18next.t("transfer.to-not-found")} type="danger" />
                )}
                {exchangeWarning && <TransferFormText msg={exchangeWarning} type="danger" />}
              </>
            )}

            <div className="grid items-center grid-cols-12">
              <div className="col-span-12 sm:col-span-2">
                <label>{i18next.t("transfer.amount")}</label>
              </div>
              <div className="col-span-12 sm:col-span-10 flex items-center">
                <InputGroup prepend="#">
                  <FormControl
                    type="text"
                    placeholder={i18next.t("transfer.amount-placeholder")}
                    value={amount}
                    onChange={(e) => {
                      const { value: amount } = e.target;
                      setAmount(amount);
                    }}
                    className={amount > balance && amountError ? "is-invalid" : ""}
                    autoFocus={mode !== "transfer"}
                  />
                </InputGroup>
                {assets.length > 1 && (
                  <TransferAssetSwitch
                    options={assets}
                    selected={asset}
                    onChange={(e) => {
                      setAsset(e);
                      exchangeHandler(to, memo);
                    }}
                  />
                )}
              </div>
            </div>

            {amountError && amount > balance && (
              <TransferFormText msg={amountError} type="danger" />
            )}

            <div className="grid items-center grid-cols-12">
              <div className="col-span-12 lg:col-span-10 lg:col-start-3">
                <div className="balance">
                  <span className="balance-label">
                    {i18next.t("transfer.balance")}
                    {": "}
                  </span>
                  <span
                    className="balance-num"
                    onClick={() => setAmount(formatNumber(getBalance(), 3))}
                  >
                    {balance} {asset}
                  </span>
                  {asset === "HP" && (
                    <div className="balance-hp-hint">{i18next.t("transfer.available-hp-hint")}</div>
                  )}
                </div>
                {to!.length > 0 &&
                  Number(amount) > 0 &&
                  toData?.__loaded &&
                  mode === "delegate" && (
                    <div className="text-gray-600 mt-1 override-warning">
                      {i18next.t("transfer.override-warning-1")}
                      {delegateAccount && (
                        <>
                          <br />
                          {i18next.t("transfer.override-warning-2", {
                            account: to,
                            previousAmount: formattedNumber(delegatedAmount)
                          })}
                        </>
                      )}
                    </div>
                  )}
              </div>
            </div>

            {showMemo && (
              <>
                <div className="grid items-center grid-cols-12 mb-4">
                  <div className="col-span-12 sm:col-span-2">
                    <label>{i18next.t("transfer.memo")}</label>
                  </div>
                  <div className="col-span-12 sm:col-span-10">
                    <FormControl
                      type="text"
                      placeholder={i18next.t("transfer.memo-placeholder")}
                      value={memo}
                      onChange={memoChanged}
                    />
                    <TransferFormText msg={i18next.t("transfer.memo-help")} type="muted" />
                    {memoError && <TransferFormText msg={memoError} type="danger" />}
                  </div>
                </div>
              </>
            )}

            <div className="grid items-center grid-cols-12 mb-4">
              <div className="col-span-12 sm:col-span-10 sm:col-start-3">
                <Button onClick={next} disabled={!canSubmit}>
                  {i18next.t("g.next")}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      )}
    </>
  );
}
