import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNoStrAccount, uploadChatPublicKey } from "../utils";
import * as ls from "../../../util/local-storage";
import { setNostrkeys } from "../managers/message-manager";
import { useMappedStore } from "../../../store/use-mapped-store";
import { ChatQueries } from "../queries";
import { useNostrPublishMutation } from "../nostr";
import { Kind } from "../../../../lib/nostr-tools/event";

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

  const { mutateAsync: uploadPublicKey } = useMutation(["chats/upload-public-key"], (key: string) =>
    uploadChatPublicKey(activeUser, key)
  );
  const { mutateAsync: updateProfile } = useNostrPublishMutation(
    ["chats/update-nostr-profile"],
    Kind.Metadata,
    () => {}
  );

  return useMutation(["chat-join-chat"], async () => createNoStrAccount(), {
    onSuccess: async (keys: ReturnType<typeof createNoStrAccount>) => {
      ls.set(`${activeUser?.username}_nsPrivKey`, keys.priv);
      await uploadPublicKey(keys.pub);

      setNostrkeys(keys);
      queryClient.setQueryData([ChatQueries.PUBLIC_KEY], keys.pub);
      queryClient.setQueryData([ChatQueries.PRIVATE_KEY], keys.priv);

      await updateProfile({
        tags: [],
        eventMetadata: {
          name: activeUser?.username!,
          about: "",
          picture: ""
        }
      });

      onSuccess?.();
    }
  });
}
