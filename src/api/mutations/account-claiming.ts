import { useMutation } from "@tanstack/react-query";
import { PrivateKey } from "@hiveio/dhive";
import { claimAccount, claimAccountByKeychain } from "../operations";
import { FullAccount } from "@/entities";
import { getQueryClient, QueryIdentifiers } from "@/core/react-query";

export function useAccountClaiming(account: FullAccount) {
  return useMutation({
    mutationKey: ["account-claiming", account.name],
    mutationFn: async ({ isKeychain, key }: { key?: PrivateKey; isKeychain?: boolean }) => {
      try {
        if (isKeychain) {
          return await claimAccountByKeychain(account);
        }

        if (key) {
          return await claimAccount(account, key);
        }

        throw new Error();
      } catch (error) {
        throw new Error("Failed RC claiming. Please, try again or contact with support.");
      }
    },
    onSuccess: () => {
      getQueryClient().setQueryData<FullAccount>(
        [QueryIdentifiers.GET_ACCOUNT_FULL, account.name],
        (data) => {
          if (!data) {
            return data;
          }

          data.pending_claimed_accounts = 0;
          return data;
        }
      );
    }
  });
}
