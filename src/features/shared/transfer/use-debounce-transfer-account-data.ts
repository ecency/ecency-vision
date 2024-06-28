import { useEffect, useMemo, useState } from "react";
import badActors from "@hiveio/hivescript/bad-actors.json";
import { error } from "@/features/shared";
import { formatError } from "@/api/operations";
import { useTransferSharedState } from "./transfer-shared-state";
import {
  getAccountFullQuery,
  getDynamicPropsQuery,
  getVestingDelegationsQuery
} from "@/api/queries";
import { useDebounce } from "react-use";
import i18next from "i18next";
import { useGlobalStore } from "@/core/global-store";
import { formattedNumber, parseAsset, vestsToHp } from "@/utils";

export function useDebounceTransferAccountData() {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const { to, mode, setAmount, setTo } = useTransferSharedState();

  const [toDebounce, setToDebounce] = useState<string>();
  const [vestingDelegationUsername, setVestingDelegationUsername] = useState<string>();
  const [toWarning, setToWarning] = useState<string>();

  const { data: dynamicProps } = getDynamicPropsQuery().useClientQuery();
  const {
    data: toData,
    error: toError,
    isLoading: toLoading
  } = getAccountFullQuery(toDebounce).useClientQuery();
  const {
    data: vestingDelegations,
    error: vestingDelegationsError,
    isLoading: vestingLoading
  } = getVestingDelegationsQuery(vestingDelegationUsername, to, 1000).useClientQuery();

  const [delegatedAmount, amount, delegateAccount] = useMemo(() => {
    const delegateAccount =
      vestingDelegations &&
      vestingDelegations.length > 0 &&
      vestingDelegations!.find(
        (item) => (item as any).delegatee === to && (item as any).delegator === activeUser?.username
      );
    const delegatedAmount = delegateAccount
      ? Number(
          formattedNumber(
            vestsToHp(
              Number(parseAsset(delegateAccount!.vesting_shares).amount),
              dynamicProps!.hivePerMVests
            )
          )
        )
      : 0;

    return [
      delegatedAmount,
      delegatedAmount ? delegatedAmount.toString() : "0.001",
      delegateAccount
    ];
  }, [activeUser?.username, dynamicProps!.hivePerMVests, to, vestingDelegations]);

  useDebounce(
    async () => {
      if (to === "") {
        setToWarning(undefined);
        return;
      }

      setToWarning(badActors.includes(to) ? i18next.t("transfer.to-bad-actor") : "");
      setToDebounce(toDebounce);
    },
    500,
    []
  );

  useEffect(() => {
    setAmount(amount);
  }, [amount]);

  useEffect(() => {
    if (activeUser && activeUser.username && mode === "delegate") {
      setVestingDelegationUsername(activeUser.username);
    }
  }, [activeUser, mode, toData]);

  useEffect(() => {
    if (vestingDelegationsError) {
      error(...formatError(vestingDelegationsError));
    }
  }, [vestingDelegationsError]);

  useEffect(() => {
    if (toError) {
      error(...formatError(toError));
    }
  }, [toError]);

  return {
    toWarning,
    delegatedAmount,
    toData: useMemo(() => {
      if (
        [
          "transfer-saving",
          "withdraw-saving",
          "convert",
          "power-up",
          "power-down",
          "claim-interest"
        ].includes(mode)
      ) {
        setTo(activeUser?.username ?? "");
        return activeUser?.data;
      }

      return toData;
    }, [activeUser?.data, activeUser?.username, mode, setTo, toData]),
    toError,
    delegateAccount,
    isLoading: useMemo(() => toLoading || vestingLoading, [toLoading, vestingLoading])
  };
}
