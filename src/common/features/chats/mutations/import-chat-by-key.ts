import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getPublicKey } from "../../../../lib/nostr-tools/keys";
import { ChatQueries } from "../queries";
import { PREFIX } from "../../../util/local-storage";
import { useMappedStore } from "../../../store/use-mapped-store";
import { getUserChatPublicKey } from "../utils";

interface Payload {
  key: string;
}

export function useImportChatByKey(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { activeUser } = useMappedStore();

  return useMutation(
    ["chats/import-chat-by-key"],
    async ({ key }: Payload) => {
      const publicKey = getPublicKey(key);

      if (activeUser) {
        const activeUserExistingPublicKey = await getUserChatPublicKey(activeUser.username);

        if (activeUserExistingPublicKey !== publicKey) {
          throw new Error(
            "[Chat][Nostr] – account public key doesn't match to generated from private"
          );
        }
      }

      localStorage.setItem(PREFIX + "_nostr_pr_" + activeUser?.username, key);
      queryClient.invalidateQueries([ChatQueries.PUBLIC_KEY]);
      queryClient.invalidateQueries([ChatQueries.PRIVATE_KEY]);
    },
    {
      onSuccess
    }
  );
}
