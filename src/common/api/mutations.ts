import { useMutation } from "@tanstack/react-query";
import { usrActivity } from "./private-api";
import { claimAccount, claimAccountByKeychain } from "./operations";
import { FullAccount } from "../store/accounts/types";
import { PrivateKey } from "@hiveio/dhive";

interface Params {
  bl?: string | number;
  tx?: string | number;
}

export function useUserActivity(username: string | undefined, ty: number) {
  return useMutation(["user-activity", username, ty], async (params: Params | undefined) => {
    if (username) {
      await usrActivity(username, ty, params?.bl, params?.tx);
    }
  });
}

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
