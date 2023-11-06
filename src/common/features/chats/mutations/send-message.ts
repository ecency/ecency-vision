import { useMutation } from "@tanstack/react-query";
import { UPLOADING } from "../components/chat-popup/chat-constants";
import { useContext } from "react";
import { ChatContext } from "../chat-context-provider";
import { Channel } from "../managers/message-manager-types";
import isCommunity from "../../../helper/is-community";
import { useNostrSendDirectMessage, useNostrSendPublicMessage } from "../nostr";
import { useAddDirectContact } from "./add-direct-contact";

export function useSendMessage(
  currentChannel: Channel,
  currentUser: string,
  onSuccess: () => void
) {
  const { activeUserKeys, isActiveUserRemoved, receiverPubKey } = useContext(ChatContext);
  const { mutateAsync: sendDirectMessage } = useNostrSendDirectMessage(
    activeUserKeys.priv,
    receiverPubKey
  );
  const { mutateAsync: sendPublicMessage } = useNostrSendPublicMessage(currentChannel.id);
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

      // Add user to direct contacts if its not there yet
      // E.g. if user opened chat room directly from the address bar
      addDirectContact({ pubkey: receiverPubKey, name: currentUser });

      if (!currentChannel && isCommunity(currentUser)) {
        throw new Error("[Chat][SendMessage] – provided user is community but channel not found");
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
      onSuccess: () => onSuccess()
    }
  );
}
