import { useMutation } from "@tanstack/react-query";
import { Operation, PrivateKey } from "@hiveio/dhive";
import { client as hiveClient } from "@/api/hive";
import { useGlobalStore } from "@/core/global-store";
import { error } from "@/features/shared";
import { formatError } from "@/api/operations";
import * as keychain from "@/utils/keychain";

export function useWithDrawRouteByKey(account: string, percent: string, auto: string) {
  const activeUser = useGlobalStore((s) => s.activeUser);

  return useMutation({
    mutationKey: ["withDrawRoute", account],
    mutationFn: ({ key }: { key: PrivateKey }) => {
      const op: Operation = [
        "set_withdraw_vesting_route",
        {
          from_account: activeUser!.username,
          to_account: account,
          percent,
          auto_vest: auto === "yes"
        }
      ];

      return hiveClient.broadcast.sendOperations([op], key);
    },
    onError: (err) => error(...formatError(err))
  });
}

export function useWithDrawRouteByKeychain(account: string, percent: string, auto: string) {
  const activeUser = useGlobalStore((s) => s.activeUser);

  return useMutation({
    mutationKey: ["withDrawRoute", account],
    mutationFn: () => {
      const op: Operation = [
        "set_withdraw_vesting_route",
        {
          from_account: activeUser!.username,
          to_account: account,
          percent,
          auto_vest: auto === "yes"
        }
      ];

      return keychain.broadcast(activeUser!.username, [op], "Active");
    },
    onError: (err) => error(...formatError(err))
  });
}
