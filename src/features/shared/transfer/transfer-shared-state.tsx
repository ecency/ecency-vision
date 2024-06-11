import { createContext, useContext } from "react";
import { TransferAsset, TransferMode } from "@/features/shared";

export const TransferSharedStateContext = createContext<{
  memo: string;
  setMemo: (memo: string) => void;
  step: number;
  setStep: (step: number) => void;
  to: string;
  setTo: (v: string) => void;
  mode: TransferMode;
  setMode: (mode: TransferMode) => void;
  asset: TransferAsset;
  exchangeWarning: string;
  setExchangeWarning: (exchangeWarning: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  inProgress: boolean;
  setInProgress: (inProgress: boolean) => void;
  reset: () => void;
  amountError: string;
  setAmountError: (amountError: string) => void;
  memoError: string;
  setMemoError: (memoError: string) => void;
  setAsset: (asset: TransferAsset) => void;
}>({
  memo: "",
  setMemo: () => {},
  step: 1,
  setStep: () => {},
  to: "",
  setTo: () => {},
  mode: "transfer",
  setMode: () => {},
  asset: "HBD",
  exchangeWarning: "",
  setExchangeWarning: () => {},
  amount: "",
  setAmount: () => {},
  inProgress: false,
  setInProgress: () => {},
  reset: () => {},
  amountError: "",
  setAmountError: () => {},
  memoError: "",
  setMemoError: () => {},
  setAsset: () => {}
});

export function useTransferSharedState() {
  const {
    memo,
    setMemo,
    step,
    setStep,
    to,
    setTo,
    mode,
    asset,
    setAsset,
    exchangeWarning,
    setExchangeWarning,
    amount,
    setAmount,
    inProgress,
    setInProgress,
    reset,
    amountError,
    setAmountError,
    memoError,
    setMemoError
  } = useContext(TransferSharedStateContext);

  return {
    memo,
    setMemo,
    step,
    setStep,
    to,
    setTo,
    asset,
    mode,
    exchangeWarning,
    setExchangeWarning,
    amount,
    setAmount,
    inProgress,
    setInProgress,
    reset,
    setAmountError,
    amountError,
    memoError,
    setMemoError,
    setAsset
  };
}
