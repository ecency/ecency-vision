"use client";

import React, { useCallback, useMemo, useState } from "react";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import i18next from "i18next";
import { TransferStep1 } from "@/features/shared/transfer/transfer-step-1";
import {
  TransferSharedStateContext,
  useTransferSharedState
} from "@/features/shared/transfer/transfer-shared-state";
import { Account } from "@/entities";
import { TransferStep2 } from "@/features/shared/transfer/transfer-step-2";
import { TransferStep3 } from "@/features/shared/transfer/transfer-step-3";
import { TransferStep4 } from "@/features/shared/transfer/transfer-step-4";

export type TransferMode =
  | "transfer"
  | "transfer-saving"
  | "withdraw-saving"
  | "convert"
  | "power-up"
  | "power-down"
  | "delegate"
  | "undelegate"
  | "stake"
  | "unstake"
  | "claim-interest";
export type TransferAsset = "HIVE" | "HBD" | "HP" | "POINT";

interface Props {
  mode: TransferMode;
  asset: TransferAsset;
  to?: string;
  amount?: string;
  memo?: string;
  onHide: () => void;
  handleClickAway?: () => void;
  account?: Account;
}

function TransferC({ onHide, handleClickAway, account }: Props) {
  const { step, asset, mode } = useTransferSharedState();

  const titleLngKey = useMemo(
    () =>
      mode === "transfer" && asset === "POINT"
        ? i18next.t("transfer-title-point")
        : `${mode}-title`,
    [mode, asset]
  );

  return (
    <Modal show={true} centered={true} onHide={onHide} className="transfer-dialog" size="lg">
      <ModalHeader thin={true} closeButton={true} />
      <ModalBody>
        <div className="transfer-dialog-content">
          {step === 1 && <TransferStep1 titleLngKey={titleLngKey} />}
          {step === 2 && <TransferStep2 titleLngKey={titleLngKey} />}
          {step === 3 && <TransferStep3 onHide={onHide} />}
          {step === 4 && (
            <TransferStep4
              account={account}
              onFinish={() => {
                onHide();
                handleClickAway?.();
              }}
            />
          )}
        </div>
      </ModalBody>
    </Modal>
  );
}

export function Transfer(props: Props) {
  const [memo, setMemo] = useState(props.memo ?? "");
  const [step, setStep] = useState(1);
  const [to, setTo] = useState(props.to ?? "");
  const [mode, setMode] = useState(props.mode);
  const [amount, setAmount] = useState(props.amount ?? "0.000");
  const [exchangeWarning, setExchangeWarning] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const [asset, setAsset] = useState(props.asset);
  const [amountError, setAmountError] = useState("");
  const [memoError, setMemoError] = useState("");

  return (
    <TransferSharedStateContext.Provider
      value={{
        memo,
        setMemo,
        step,
        setStep,
        to,
        setTo,
        mode,
        setMode,
        asset,
        setAsset,
        amount,
        setAmount,
        exchangeWarning,
        setExchangeWarning,
        inProgress,
        setInProgress,
        amountError,
        setMemoError,
        memoError,
        setAmountError,
        reset: useCallback(() => {
          setStep(1);
          setMemo(props.memo ?? "");
          setTo(props.to ?? "");
          setAmount(props.amount ?? "");
          setMode(props.mode);
        }, [props.amount, props.memo, props.mode, props.to])
      }}
    >
      <TransferC {...props} />
    </TransferSharedStateContext.Provider>
  );
}
