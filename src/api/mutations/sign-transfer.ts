import { useMutation } from "@tanstack/react-query";
import {
  claimInterest,
  claimInterestHot,
  claimInterestKc,
  convert,
  convertHot,
  convertKc,
  delegateVestingShares,
  delegateVestingSharesHot,
  delegateVestingSharesKc,
  formatError,
  transfer,
  transferFromSavings,
  transferFromSavingsHot,
  transferFromSavingsKc,
  transferHot,
  transferKc,
  transferPoint,
  transferPointHot,
  transferPointKc,
  transferToSavings,
  transferToSavingsHot,
  transferToSavingsKc,
  transferToVesting,
  transferToVestingHot,
  transferToVestingKc,
  withdrawVesting,
  withdrawVestingHot,
  withdrawVestingKc
} from "@/api/operations";
import { hpToVests } from "@/features/shared/transfer/hp-to-vests";
import { error, TransferAsset, TransferMode } from "@/features/shared";
import { PrivateKey, TransactionConfirmation } from "@hiveio/dhive";
import { getDynamicPropsQuery } from "@/api/queries";
import { TxResponse } from "@/types";

export function useSignTransferByKey(mode: TransferMode, asset: TransferAsset) {
  const { data: dynamicProps } = getDynamicPropsQuery().useClientQuery();

  return useMutation({
    mutationKey: ["signTransfer", mode, asset],
    mutationFn: async ({
      username,
      key,
      to,
      fullAmount,
      memo,
      amount
    }: {
      username: string;
      key: PrivateKey;
      to: string;
      fullAmount: string;
      memo: string;
      amount: string;
    }) => {
      let promise: Promise<TransactionConfirmation>;

      switch (mode) {
        case "transfer": {
          if (asset === "POINT") {
            promise = transferPoint(username, key, to, fullAmount, memo);
          } else {
            promise = transfer(username, key, to, fullAmount, memo);
          }
          break;
        }
        case "transfer-saving": {
          promise = transferToSavings(username, key, to, fullAmount, memo);
          break;
        }
        case "convert": {
          promise = convert(username, key, fullAmount);
          break;
        }
        case "withdraw-saving": {
          promise = transferFromSavings(username, key, to, fullAmount, memo);
          break;
        }
        case "claim-interest": {
          promise = claimInterest(username, key, to, fullAmount, memo);
          break;
        }
        case "power-up": {
          promise = transferToVesting(username, key, to, fullAmount);
          break;
        }
        case "power-down": {
          const vests = hpToVests(Number(amount), dynamicProps!.hivePerMVests);
          promise = withdrawVesting(username, key, vests);
          break;
        }
        case "delegate": {
          const vests = hpToVests(Number(amount), dynamicProps!.hivePerMVests);
          promise = delegateVestingShares(username, key, to, vests);
          break;
        }
        default:
          return undefined;
      }

      return promise;
    },
    onError: (err) => error(...formatError(err))
  });
}

export function useSignTransferByKeychain(mode: TransferMode, asset: TransferAsset) {
  const { data: dynamicProps } = getDynamicPropsQuery().useClientQuery();

  return useMutation({
    mutationKey: ["signTransferByKeychain", mode, asset],
    mutationFn: async ({
      username,
      to,
      fullAmount,
      memo,
      amount
    }: {
      username: string;
      to: string;
      fullAmount: string;
      memo: string;
      amount: string;
    }) => {
      let promise: Promise<TxResponse>;
      switch (mode) {
        case "transfer": {
          if (asset === "POINT") {
            promise = transferPointKc(username, to, fullAmount, memo);
          } else {
            promise = transferKc(username, to, fullAmount, memo);
          }
          break;
        }
        case "transfer-saving": {
          promise = transferToSavingsKc(username, to, fullAmount, memo);
          break;
        }
        case "convert": {
          promise = convertKc(username, fullAmount);
          break;
        }
        case "withdraw-saving": {
          promise = transferFromSavingsKc(username, to, fullAmount, memo);
          break;
        }
        case "claim-interest": {
          promise = claimInterestKc(username, to, fullAmount, memo);
          break;
        }
        case "power-up": {
          promise = transferToVestingKc(username, to, fullAmount);
          break;
        }
        case "power-down": {
          const vests = hpToVests(Number(amount), dynamicProps!.hivePerMVests);
          promise = withdrawVestingKc(username, vests);
          break;
        }
        case "delegate": {
          const vests = hpToVests(Number(amount), dynamicProps!.hivePerMVests);
          promise = delegateVestingSharesKc(username, to, vests);
          break;
        }
        default:
          return undefined;
      }
      return promise;
    },
    onError: (err) => error(...formatError(err))
  });
}

export function useSignTransferByHiveSigner(mode: TransferMode, asset: TransferAsset) {
  const { data: dynamicProps } = getDynamicPropsQuery().useClientQuery();

  return useMutation({
    mutationKey: ["signTransferByHiveSigner", mode, asset],
    mutationFn: async ({
      username,
      to,
      fullAmount,
      memo,
      amount
    }: {
      username: string;
      to: string;
      fullAmount: string;
      memo: string;
      amount: string;
    }) => {
      switch (mode) {
        case "transfer": {
          if (asset === "POINT") {
            transferPointHot(username, to, fullAmount, memo);
          } else {
            transferHot(username, to, fullAmount, memo);
          }
          break;
        }
        case "transfer-saving": {
          transferToSavingsHot(username, to, fullAmount, memo);
          break;
        }
        case "convert": {
          convertHot(username, fullAmount);
          break;
        }
        case "withdraw-saving": {
          transferFromSavingsHot(username, to, fullAmount, memo);
          break;
        }
        case "claim-interest": {
          claimInterestHot(username, to, fullAmount, memo);
          break;
        }
        case "power-up": {
          transferToVestingHot(username, to, fullAmount);
          break;
        }
        case "power-down": {
          const vests = hpToVests(Number(amount), dynamicProps!.hivePerMVests);
          withdrawVestingHot(username, vests);
          break;
        }
        case "delegate": {
          const vests = hpToVests(Number(amount), dynamicProps!.hivePerMVests);
          delegateVestingSharesHot(username, to, vests);
          break;
        }
        default:
          return;
      }
    },
    onError: (err) => error(...formatError(err))
  });
}
