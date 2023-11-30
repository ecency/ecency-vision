import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { ChatContext } from "../chat-context-provider";
import isCommunity from "../../../helper/is-community";
import { Channel, Message, useNostrSendDirectMessage, useNostrSendPublicMessage } from "../nostr";
import { ChatQueries, useMessagesQuery } from "../queries";
import { useKeysQuery } from "../queries/keys-query";
import { PublishNostrError } from "../nostr/errors";
import { convertEvent } from "../nostr/utils/event-converter";
import { Kind } from "../../../../lib/nostr-tools/event";

export function useResendMessage(
  currentChannel?: Channel,
  currentUser?: string,
  onSuccess?: () => void
) {
  const queryClient = useQueryClient();

  const { receiverPubKey } = useContext(ChatContext);
  const { privateKey, publicKey } = useKeysQuery();
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

  return useMutation(
    ["chats/send-message"],
    async (message: Message) => {
      if (!currentChannel && isCommunity(currentUser)) {
        throw new Error("[Chat][SendMessage] – provided user is community but channel not found");
      }

      if (currentChannel) {
        return sendPublicMessage({ message: message.content });
      } else if (currentUser) {
        return sendDirectMessage(message.content);
      } else {
        throw new Error("[Chat][SendMessage] – no receiver");
      }
    },
    {
      onSuccess: (message) => {
        message.sent = 0;
        queryClient.setQueryData(
          [ChatQueries.MESSAGES, currentChannel?.communityName ?? currentUser],
          [...messages.filter((m) => m.content !== message.content && m.sent !== 2), message]
        );
        onSuccess?.();
      },
      onError: async (error: PublishNostrError | Error) => {
        if ("event" in error) {
          const message = await convertEvent<Kind.EncryptedDirectMessage | Kind.ChannelMessage>(
            error.event,
            publicKey!!,
            privateKey!!
          )!!;
          message.sent = 2;
          queryClient.setQueryData(
            [ChatQueries.MESSAGES, currentChannel?.communityName ?? currentUser],
            [...messages.filter((m) => m.content !== message.content && m.sent !== 2), message]
          );
        }
      }
    }
  );
}
