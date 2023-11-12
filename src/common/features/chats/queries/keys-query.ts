import { useQueries } from "@tanstack/react-query";
import { ChatQueries } from "./queries";
import { getUserChatPublicKey } from "../utils";
import { useMappedStore } from "../../../store/use-mapped-store";
import { useMemo } from "react";
import { PREFIX } from "../../../util/local-storage";

export function useKeysQuery() {
  const { activeUser } = useMappedStore();

  const [
    { data: publicKey, refetch: refetchPublicKey },
    { data: privateKey, refetch: refetchPrivateKey }
  ] = useQueries({
    queries: [
      {
        queryKey: [ChatQueries.PUBLIC_KEY, activeUser?.username],
        queryFn: async () => getUserChatPublicKey(activeUser?.username!)
      },
      {
        queryKey: [ChatQueries.PRIVATE_KEY, activeUser?.username],
        queryFn: () => localStorage.getItem(PREFIX + "_nostr_pr_" + activeUser?.username)
      }
    ]
  });

  const hasKeys = useMemo(() => !!publicKey && !!privateKey, [publicKey, privateKey]);

  return {
    publicKey,
    privateKey,
    hasKeys,
    refetch: () => {
      refetchPublicKey();
      refetchPrivateKey();
    }
  };
}
