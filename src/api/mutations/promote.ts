import { useMutation } from "@tanstack/react-query";
import * as keychain from "@/utils/keychain";
import { useGlobalStore } from "@/core/global-store";
import { error } from "@/features/shared";
import { formatError } from "@/api/operations";
import { client as hiveClient } from "@/api/hive";
import { PrivateKey } from "@hiveio/dhive";

export function usePromoteByKeychain() {
  const activeUser = useGlobalStore((s) => s.activeUser);

  return useMutation({
    mutationKey: ["promote-by-keychain"],
    mutationFn: ({ path, duration }: { path: string; duration: number }) => {
      const [author, permlink] = path.replace("@", "").split("/");
      const json = JSON.stringify({
        user: activeUser?.username,
        author,
        permlink,
        duration
      });
      return keychain.customJson(activeUser!.username, "ecency_promote", "Active", json, "Promote");
    },
    onError: (err) => error(...formatError(err))
  });
}

export function usePromoteByApi() {
  const activeUser = useGlobalStore((s) => s.activeUser);

  return useMutation({
    mutationKey: ["promote-by-api"],
    mutationFn: ({ path, duration, key }: { path: string; duration: number; key: PrivateKey }) => {
      const [author, permlink] = path.replace("@", "").split("/");
      const json = JSON.stringify({
        user: activeUser!.username,
        author,
        permlink,
        duration
      });

      const op = {
        id: "ecency_promote",
        json,
        required_auths: [activeUser!.username],
        required_posting_auths: []
      };

      return hiveClient.broadcast.json(op, key);
    },
    onError: (err) => error(...formatError(err))
  });
}
