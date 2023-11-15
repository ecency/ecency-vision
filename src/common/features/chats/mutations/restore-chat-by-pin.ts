import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PREFIX } from "../../../util/local-storage";
import { EncryptionTools, getUserChatPrivateKey } from "../utils";
import { ChatQueries } from "../queries";
import { useMappedStore } from "../../../store/use-mapped-store";
import { useNostrPublishMutation } from "../nostr";
import { Kind } from "../../../../lib/nostr-tools/event";
import { useKeysQuery } from "../queries/keys-query";
import { useGetAccountFullQuery } from "../../../api/queries";

export function useRestoreChatByPin() {
  const queryClient = useQueryClient();
  const { activeUser } = useMappedStore();

  const { data: fullAccount } = useGetAccountFullQuery(activeUser?.username);
  const { mutateAsync: updateProfile } = useNostrPublishMutation(
    ["chats/update-nostr-profile"],
    Kind.Metadata,
    () => {}
  );
  const { publicKey } = useKeysQuery();

  return useMutation(["chats/restore-chat-by-pin"], async (pin: string) => {
    if (!pin || !publicKey || !fullAccount) {
      throw new Error("[Chat][Nostr] – no pin, public key or account information");
    }

    const { iv: initialVector, key: privateKey } = getUserChatPrivateKey(fullAccount!!);

    if (!initialVector || !privateKey) {
      throw new Error("[Chat][Nostr] – no initial vector or private key");
    }

    const decryptedKey = EncryptionTools.decrypt(
      privateKey,
      pin,
      Buffer.from(initialVector, "base64")
    );
    queryClient.setQueryData([ChatQueries.PRIVATE_KEY, activeUser?.username], decryptedKey);

    localStorage.setItem(PREFIX + "_nostr_pr_" + activeUser?.username, pin);

    await updateProfile({
      tags: [],
      eventMetadata: {
        name: activeUser?.username!,
        about: "",
        picture: ""
      }
    });
  });
}
