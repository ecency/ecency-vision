import { useQueries } from "@tanstack/react-query";
import { ChatQueries } from "./queries";
import { EncryptionTools, getUserChatPrivateKey, getUserChatPublicKey } from "../utils";
import { useMappedStore } from "../../../store/use-mapped-store";
import { useMemo } from "react";
import { PREFIX } from "../../../util/local-storage";
import { useGetAccountFullQuery } from "../../../api/queries";

export function useKeysQuery() {
  const { activeUser } = useMappedStore();

  const { data } = useGetAccountFullQuery(activeUser?.username);

  const [
    { data: publicKey, refetch: refetchPublicKey },
    { data: privateKey, refetch: refetchPrivateKey }
  ] = useQueries({
    queries: [
      {
        queryKey: [ChatQueries.PUBLIC_KEY, activeUser?.username],
        queryFn: async () => getUserChatPublicKey(data!!),
        enabled: !!data
      },
      {
        queryKey: [ChatQueries.PRIVATE_KEY, activeUser?.username],
        queryFn: async () => {
          const pin = localStorage.getItem(PREFIX + "_nostr_pr_" + activeUser?.username);
          const { key, iv } = await getUserChatPrivateKey(data!!);
          if (key && pin && iv) {
            return EncryptionTools.decrypt(key, pin, Buffer.from(iv, "base64"));
          }

          return undefined;
        },
        enabled: !!data
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
