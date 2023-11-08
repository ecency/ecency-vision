import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UPLOADING } from "../components/chat-popup/chat-constants";
import { useContext } from "react";
import { ChatContext } from "../chat-context-provider";
import { Channel } from "../managers/message-manager-types";
import isCommunity from "../../../helper/is-community";
import { useNostrSendDirectMessage, useNostrSendPublicMessage } from "../nostr";
import { useAddDirectContact } from "./add-direct-contact";
import { ChatQueries, useMessagesQuery } from "../queries";
import { useKeysQuery } from "../queries/keys-query";

export function useSendMessage(
  currentChannel?: Channel,
  currentUser?: string,
  onSuccess?: () => void
) {
  const queryClient = useQueryClient();

  const { isActiveUserRemoved, receiverPubKey } = useContext(ChatContext);
  const { privateKey } = useKeysQuery();
  const { data: messages } = useMessagesQuery(currentChannel?.communityName ?? currentUser);

  const { mutateAsync: sendDirectMessage } = useNostrSendDirectMessage(
    privateKey!!,
    receiverPubKey,
    undefined
  );
  const { mutateAsync: sendPublicMessage } = useNostrSendPublicMessage(
    currentChannel?.id,
    undefined
  );
  const { mutateAsync: addDirectContact } = useAddDirectContact();

  return useMutation(
    ["chats/send-message"],
    async (message: string) => {
      if (!message || message.includes(UPLOADING)) {
        throw new Error("[Chat][SendMessage] – empty message or has uploading file");
      }

      if (isActiveUserRemoved) {
        throw new Error("[Chat][SendMessage] – no active user");
      }

      if (!currentChannel && isCommunity(currentUser)) {
        throw new Error("[Chat][SendMessage] – provided user is community but channel not found");
      }

      // Add user to direct contacts if it's not there yet
      // E.g. if user opened chat room directly from the address bar
      if (currentUser) {
        addDirectContact({ pubkey: receiverPubKey, name: currentUser });
      }

      if (currentChannel) {
        return sendPublicMessage({ message });
      } else if (currentUser) {
        return sendDirectMessage(message);
      } else {
        throw new Error("[Chat][SendMessage] – no receiver");
      }
    },
    {
      onSuccess: (message) => {
        queryClient.setQueryData(
          [ChatQueries.MESSAGES, currentChannel?.communityName ?? currentUser],
          [...messages, message]
        );
        queryClient.invalidateQueries([
          ChatQueries.MESSAGES,
          currentChannel?.communityName ?? currentUser
        ]);

        onSuccess?.();
      }
    }
  );
}
