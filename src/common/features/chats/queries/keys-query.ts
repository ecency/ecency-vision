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

  const [{ data: publicKey }, { data: privateKey }, { data: iv }] = useQueries({
    queries: [
      {
        queryKey: [ChatQueries.PUBLIC_KEY, activeUser?.username],
        queryFn: async () => getUserChatPublicKey(data!!),
        enabled: !!data,
        initialData: null
      },
      {
        queryKey: [ChatQueries.PRIVATE_KEY, activeUser?.username],
        queryFn: async () => {
          const pin = localStorage.getItem(PREFIX + "_nostr_pr_" + activeUser?.username);

          if (!pin) {
            return null;
          }

          const { key, iv } = getUserChatPrivateKey(data!!);
          if (key && pin && iv) {
            try {
              return EncryptionTools.decrypt(key, pin, Buffer.from(iv, "base64"));
            } catch (e) {
              return null;
            }
          }

          return null;
        },
        enabled: !!data,
        initialData: null
      },
      {
        queryKey: [ChatQueries.ACCOUNT_IV, activeUser?.username],
        queryFn: async () => getUserChatPrivateKey(data!!).iv,
        enabled: !!data,
        initialData: null
      }
    ]
  });

  const hasKeys = useMemo(() => !!publicKey && !!privateKey, [publicKey, privateKey]);

  return useMemo(
    () => ({
      publicKey,
      privateKey,
      hasKeys,
      iv
    }),
    [publicKey, privateKey, hasKeys]
  );
}
