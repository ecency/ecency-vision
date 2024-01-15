import { FullAccount } from "../../store/accounts/types";
import { useMutation } from "@tanstack/react-query";
import { PrivateKey } from "@hiveio/dhive";
import { claimAccount, claimAccountByKeychain } from "../operations";

export function useAccountClaiming(account: FullAccount) {
  return useMutation(
    ["account-claiming", account.name],
    async ({ isKeychain, key }: { key?: PrivateKey; isKeychain?: boolean }) => {
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
    }
  );
}
