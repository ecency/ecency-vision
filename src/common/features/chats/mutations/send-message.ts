import { useMutation } from "@tanstack/react-query";
import { UPLOADING } from "../components/chat-popup/chat-constants";
import { useContext } from "react";
import { ChatContext } from "../chat-context-provider";
import { Channel } from "../managers/message-manager-types";
import { useDirectContactsQuery } from "../queries";
import isCommunity from "../../../helper/is-community";

export function useSendMessage(
  currentChannel: Channel,
  currentUser: string,
  onSuccess: () => void
) {
  const { messageServiceInstance, isActiveUserRemoved, receiverPubKey } = useContext(ChatContext);
  const { data: directContacts } = useDirectContactsQuery();

  return useMutation(
    ["chats/send-message"],
    async (message: string) => {
      if (!message || message.includes(UPLOADING)) {
        throw new Error("[Chat][SendMessage] – empty message or has uploading file");
      }

      if (isActiveUserRemoved) {
        throw new Error("[Chat][SendMessage] – no active user");
      }

      // Set the user as direct contact if it isn't there yet
      if (
        receiverPubKey &&
        !directContacts?.some((contact) => contact.name === currentUser) &&
        !!currentUser
      ) {
        messageServiceInstance?.publishContacts(currentUser, receiverPubKey);
      }

      if (!currentChannel && isCommunity(currentUser)) {
        throw new Error("[Chat][SendMessage] – provided user is community but channel not found");
      }

      if (currentChannel) {
        return messageServiceInstance?.sendPublicMessage(currentChannel, message, [], "");
      } else if (currentUser) {
        return messageServiceInstance?.sendDirectMessage(receiverPubKey!, message);
      } else {
        throw new Error("[Chat][SendMessage] – no receiver");
      }
    },
    {
      onSuccess: () => onSuccess()
    }
  );
}
