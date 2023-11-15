import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNoStrAccount, EncryptionTools, uploadChatKeys } from "../utils";
import { PREFIX } from "../../../util/local-storage";
import { useMappedStore } from "../../../store/use-mapped-store";
import { useNostrPublishMutation } from "../nostr";
import { Kind } from "../../../../lib/nostr-tools/event";
import { ChatQueries } from "../queries";

const crypto = require("crypto");

/**
 * Custom React hook for joining a chat with some side effects.
 *
 * This hook manages the process of joining a chat, resetting chat state, and uploading
 * a public key for secure communication.
 *
 * @param onSuccess - A callback function to be called upon successful completion of chat join.
 *
 * @returns A function from the `useMutation` hook, which can be used to initiate the chat join process.
 */
export function useJoinChat(onSuccess?: () => void) {
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
    ["chat-join-chat"],
    async (pin: string) => {
      const keys = createNoStrAccount();
      localStorage.setItem(PREFIX + "_nostr_pr_" + activeUser?.username, pin);

      const initialVector = crypto.randomBytes(16);
      const encryptedKey = EncryptionTools.encrypt(keys.priv, pin, initialVector);
      await uploadKeys({ pub: keys.pub, priv: encryptedKey, iv: initialVector });

      queryClient.setQueryData([ChatQueries.PUBLIC_KEY, activeUser?.username], keys.pub);
      queryClient.setQueryData([ChatQueries.PRIVATE_KEY, activeUser?.username], keys.priv);

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
