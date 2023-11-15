import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatQueries } from "../queries";
import { PREFIX } from "../../../util/local-storage";
import { useMappedStore } from "../../../store/use-mapped-store";
import { EncryptionTools, uploadChatKeys } from "../utils";
import { useNostrPublishMutation } from "../nostr";
import { Kind } from "../../../../lib/nostr-tools/event";

interface Payload {
  publicKey: string;
  privateKey: string;
  pin: string;
  iv: string;
}

export function useImportChatByKeys(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { activeUser } = useMappedStore();

  const { mutateAsync: uploadKeys } = useMutation(
    ["chats/upload-public-key"],
    (keys: Parameters<typeof uploadChatKeys>[1]) => uploadChatKeys(activeUser, keys)
  );
  const { mutateAsync: updateProfile } = useNostrPublishMutation(
    ["chats/update-nostr-profile"],
    Kind.Metadata,
    () => {}
  );

  return useMutation(
    ["chats/import-chat-by-key"],
    async ({ publicKey, privateKey, pin, iv }: Payload) => {
      if (!activeUser) {
        return;
      }

      const initialVector = Buffer.from(iv, "base64");
      const encryptedKey = EncryptionTools.encrypt(privateKey, pin, initialVector);

      await uploadKeys({ pub: publicKey, priv: encryptedKey, iv: initialVector });

      localStorage.setItem(PREFIX + "_nostr_pr_" + activeUser?.username, pin);
      queryClient.setQueryData([ChatQueries.PUBLIC_KEY, activeUser?.username], publicKey);
      queryClient.setQueryData([ChatQueries.PRIVATE_KEY, activeUser?.username], privateKey);

      await updateProfile({
        tags: [],
        eventMetadata: {
          name: activeUser?.username!,
          about: "",
          picture: ""
        }
      });
    },
    {
      onSuccess
    }
  );
}
