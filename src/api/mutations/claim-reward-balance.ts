import { useMutation } from "@tanstack/react-query";
import { broadcastPostingOperations, claimRewardBalance, formatError } from "@/api/operations";
import { Operation } from "@hiveio/dhive";
import { useGlobalStore } from "@/core/global-store";
import { getAccountFullQuery } from "@/api/queries";
import { error, success } from "@/features/shared";
import i18next from "i18next";

export function useClaimRewardBalance() {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const { refetch } = getAccountFullQuery(activeUser?.username).useClientQuery();

  return useMutation({
    mutationKey: ["claimRewardBalance", activeUser?.username],
    mutationFn: async () => {
      const { data } = await refetch();
      if (!data) {
        throw new Error("Failed to fetch account while claiming balance");
      }

      const {
        reward_hive_balance: hiveBalance = data.reward_hive_balance,
        reward_hbd_balance: hbdBalance = data.reward_hbd_balance,
        reward_vesting_balance: vestingBalance
      } = data;
      const params = {
        account: activeUser?.username,
        reward_hive: hiveBalance,
        reward_hbd: hbdBalance,
        reward_vests: vestingBalance
      };

      const opArray: Operation[] = [["claim_reward_balance", params]];

      return broadcastPostingOperations(activeUser!.username, opArray);
    },
    onError: (err) => error(...formatError(err)),
    onSuccess: () => {
      success(i18next.t("wallet.claim-reward-balance-ok"));
    }
  });
}
